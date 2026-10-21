import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();

// --- Stubs do ambiente Supabase ---
await db.exec(`
  create role authenticated;
  create role anon;
  create schema auth;
  create schema storage;
  create or replace function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to authenticated, anon;
`);

// --- Roda o schema real ---
const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
await db.exec(sql);
await db.exec(`grant select, insert, update, delete on all tables in schema public to authenticated;
               grant execute on all functions in schema public to authenticated;
               grant select, insert, update, delete on storage.objects to authenticated;`);

let falhas = 0;
const check = (nome, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${nome} ${extra}`);
  if (!ok) falhas++;
};

async function como(email, fn) {
  await db.exec(`select set_config('request.jwt.claims', '${JSON.stringify({ email })}', false)`);
  await db.exec("set role authenticated");
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
const q = async (text) => (await db.query(text)).rows;

// Conteúdo: módulo 1 e 2 (dia 0), módulo 3 (dia 7) já vêm do seed do schema
const mods = await q("select id, title, unlock_after_days from public.modules order by position");
check("seed criou 3 módulos + bono Color", mods.length === 4);
const [m1, m2, m3, mBono] = mods;
check("bono Color: is_bonus e abre ao dia 7", !!(await q("select 1 from public.modules where is_bonus and title='Bono: Color' and unlock_after_days=7")).length);
await db.exec(`
  insert into public.lessons (module_id, title, position) values
    ('${m1.id}', 'Aula 1.1', 1),
    ('${m3.id}', 'Aula 3.1', 1),
    ('${mBono.id}', 'Aula bono 1', 1);
  insert into public.lessons (module_id, title, position, unlock_after_days) values
    ('${m1.id}', 'Aula 1.3 dia 7', 3, 7);
  insert into public.lessons (module_id, title, position, published_at) values
    ('${m1.id}', 'Aula 1.2 agendada', 2, now() + interval '3 days');
`);

// 1) Sem assinatura
let r = await como("ninguem@x.com", () => q("select * from public.my_modules()"));
check("sem assinatura: my_modules vazio", r.length === 0);
r = await como("ninguem@x.com", () => q("select title from public.lessons"));
check("sem assinatura: nenhuma aula visível", r.length === 0);
r = await como("ninguem@x.com", () => q("select * from public.modules"));
check("sem assinatura: nenhum módulo visível", r.length === 0);

// 2) Comprou agora
await db.exec(`insert into public.subscriptions (email, paypal_subscription_id, status, purchased_at, access_until)
               values ('novo@x.com', 'I-NOVO', 'active', now(), now() + interval '30 days')`);
r = await como("Novo@X.com", () => q("select title, is_unlocked from public.my_modules() order by position"));
check("comprou agora: 4 módulos listados (case-insensitive no e-mail)", r.length === 4);
check("comprou agora: módulos 1 e 2 abertos, 3 fechado", r[0]?.is_unlocked && r[1]?.is_unlocked && !r[2]?.is_unlocked && !r[3]?.is_unlocked, JSON.stringify(r.map((x) => x.is_unlocked)));
r = await como("novo@x.com", () => q("select title from public.lessons order by title"));
check("comprou agora: vê Aula 1.1, NÃO vê a do módulo 3, a do bono, a agendada nem a do dia 7", r.length === 1 && r[0].title === "Aula 1.1", JSON.stringify(r));
r = await como("novo@x.com", () => q("select title, is_unlocked from public.my_lessons() order by title"));
check("comprou agora: my_lessons mostra aula do dia 7 bloqueada e esconde módulos fechados", r.map((x) => `${x.title}:${x.is_unlocked}`).join() === "Aula 1.1:true,Aula 1.3 dia 7:false", JSON.stringify(r));
r = await como("novo@x.com", () => q("select is_bonus from public.my_modules() where title='Bono: Color'"));
check("comprou agora: bono Color listado como bono e bloqueado", r.length === 1 && r[0].is_bonus === true);

// 3) Comprou há 8 dias
await db.exec(`insert into public.subscriptions (email, paypal_subscription_id, status, purchased_at, access_until)
               values ('antigo@x.com', 'I-ANTIGO', 'active', now() - interval '8 days', now() + interval '22 days')`);
r = await como("antigo@x.com", () => q("select is_unlocked from public.my_modules()"));
check("há 8 dias: todos os módulos abertos", r.length === 4 && r.every((x) => x.is_unlocked));
r = await como("antigo@x.com", () => q("select title from public.lessons order by title"));
check("há 8 dias: vê aulas do módulo 3, bono e do dia 7 (mas ainda não a agendada)", r.map((x) => x.title).join() === "Aula 1.1,Aula 1.3 dia 7,Aula 3.1,Aula bono 1", JSON.stringify(r));

// 4) Cancelada: acesso até fim do período pago
await db.exec(`insert into public.subscriptions (email, paypal_subscription_id, status, purchased_at, access_until)
               values ('cancelou@x.com', 'I-CANC', 'cancelled', now() - interval '10 days', now() + interval '5 days'),
                      ('venceu@x.com', 'I-VENC', 'cancelled', now() - interval '40 days', now() - interval '1 day'),
                      ('suspensa@x.com', 'I-SUSP', 'suspended', now() - interval '10 days', now() + interval '5 days')`);
r = await como("cancelou@x.com", () => q("select * from public.my_modules()"));
check("cancelada com período pago futuro: mantém acesso", r.length === 4);
r = await como("venceu@x.com", () => q("select * from public.my_modules()"));
check("cancelada com período vencido: sem acesso", r.length === 0);
r = await como("suspensa@x.com", () => q("select * from public.my_modules()"));
check("suspensa: sem acesso", r.length === 0);

// 5) Reembolsada
await db.exec(`insert into public.subscriptions (email, paypal_subscription_id, status, purchased_at, access_until, refunded_at)
               values ('reembolso@x.com', 'I-REF', 'cancelled', now() - interval '2 days', now() + interval '28 days', now())`);
r = await como("reembolso@x.com", () => q("select * from public.my_modules()"));
check("reembolsada: sem acesso", r.length === 0);

// 6) Isolamento de assinaturas e progresso
r = await como("novo@x.com", () => q("select email from public.subscriptions"));
check("aluno só enxerga a própria assinatura", r.length === 1 && r[0].email === "novo@x.com", JSON.stringify(r));
const aula11 = (await q("select id from public.lessons where title='Aula 1.1'"))[0].id;
await como("novo@x.com", () => db.exec(`insert into public.lesson_progress (user_email, lesson_id) values ('novo@x.com', '${aula11}')`));
r = await como("antigo@x.com", () => q("select * from public.lesson_progress"));
check("progresso é privado por aluno", r.length === 0);
let negado = false;
try {
  await como("antigo@x.com", () => db.exec(`insert into public.lesson_progress (user_email, lesson_id) values ('novo@x.com', '${aula11}')`));
} catch { negado = true; }
check("aluno não consegue gravar progresso em nome de outro", negado);

// 7) Aluno não escreve em módulos/aulas/assinaturas
for (const [nome, cmd] of [
  ["inserir módulo", `insert into public.modules (title) values ('hack')`],
  ["apagar aula", `delete from public.lessons`],
  ["alterar assinatura", `update public.subscriptions set status='active'`],
]) {
  let n = 0;
  try {
    const res = await como("novo@x.com", () => db.query(cmd));
    n = res.affectedRows ?? 0;
  } catch { n = 0; }
  check(`aluno não consegue ${nome}`, n === 0);
}

// 8) Admin
await db.exec(`insert into public.admins (email) values ('admin@x.com')`);
r = await como("admin@x.com", () => q("select is_unlocked from public.my_modules()"));
check("admin sem compra: vê os 4 módulos abertos", r.length === 4 && r.every((x) => x.is_unlocked));
r = await como("admin@x.com", () => q("select title from public.lessons"));
check("admin vê todas as aulas (inclusive agendada e do dia 7)", r.length === 5, JSON.stringify(r));
r = await como("admin@x.com", () => q("select email from public.subscriptions"));
check("admin vê todas as assinaturas", r.length === 6, String(r.length));
await como("admin@x.com", () => db.exec(`insert into public.modules (title, position) values ('Novo do admin', 9)`));
check("admin cria módulo", (await q("select 1 from public.modules where title='Novo do admin'")).length === 1);

// 9) Leads e e-mail marketing
await db.exec(`insert into public.leads (email, plan, source, checkout_at) values ('lead1@x.com', 'monthly', 'checkout', now()), ('lead2@x.com', 'annual', 'checkout', now()), ('lead3@x.com', 'monthly', 'checkout', now())`);
const l1 = (await q("select id from public.leads where email='lead1@x.com'"))[0].id;
const l2 = (await q("select id from public.leads where email='lead2@x.com'"))[0].id;
await db.exec(`insert into public.email_sends (lead_id, step, sent_at) values ('${l1}', 1, now() - interval '5 hours'), ('${l2}', 1, now() - interval '5 hours')`);
await db.exec(`update public.leads set converted_at = now() where id = '${l1}'`); // comprou depois do e-mail 1
await db.exec(`update public.leads set unsubscribed_at = now() where id = '${l2}'`);

let dup = false;
try { await db.exec(`insert into public.email_sends (lead_id, step) values ('${l1}', 1)`); } catch { dup = true; }
check("mesma etapa não pode ser enviada duas vezes ao mesmo lead", dup);

let mai = false;
try { await db.exec(`insert into public.leads (email) values ('MAIUSCULA@x.com')`); } catch { mai = true; }
check("e-mail do lead precisa estar em minúsculas", mai);

let dupMail = false;
try { await db.exec(`insert into public.leads (email) values ('lead1@x.com')`); } catch { dupMail = true; }
check("e-mail de lead é único", dupMail);

r = await como("novo@x.com", () => q("select * from public.leads"));
check("aluno não enxerga leads", r.length === 0);
r = await como("novo@x.com", () => q("select * from public.email_sends"));
check("aluno não enxerga envios", r.length === 0);
let escritaLead = 0;
try { escritaLead = (await como("novo@x.com", () => db.query(`update public.leads set converted_at = null`))).affectedRows ?? 0; } catch { escritaLead = 0; }
check("aluno não consegue alterar leads", escritaLead === 0);

r = await como("novo@x.com", () => q("select public.email_stats() as s"));
check("email_stats retorna null para quem não é admin", r[0].s === null);
r = await como("admin@x.com", () => q("select public.email_stats() as s"));
const s = r[0].s;
check("email_stats (admin): 3 leads", s.leads === 3, JSON.stringify(s));
check("email_stats (admin): 1 pendente (lead3)", s.pendientes === 1, JSON.stringify(s));
check("email_stats (admin): 1 recuperado (lead1 comprou depois do e-mail)", s.recuperados === 1, JSON.stringify(s));
check("email_stats (admin): 1 descadastro", s.bajas === 1, JSON.stringify(s));
check("email_stats (admin): 2 envios da etapa 1", s.enviados["1"] === 2, JSON.stringify(s));

// 10) Atividade dos alunos, histórico de e-mails e equipe
const aulaVisivel = (await q("select id from public.lessons where title='Aula 1.1'"))[0].id;
const aulaFutura = (await q("select id from public.lessons where title='Aula 1.2 agendada'"))[0].id;
await como("novo@x.com", () => q(`select public.registrar_vista('${aulaVisivel}')`));
await como("novo@x.com", () => q(`select public.registrar_vista('${aulaVisivel}')`));
r = await q("select views from public.lesson_views where user_email='novo@x.com'");
check("registrar_vista: 2 aberturas da mesma aula = 1 linha com views=2", r.length === 1 && r[0].views === 2, JSON.stringify(r));
let vistaBloqueada = false;
try { await como("novo@x.com", () => q(`select public.registrar_vista('${aulaFutura}')`)); } catch { vistaBloqueada = true; }
check("registrar_vista: não registra aula que o aluno não enxerga (agendada)", vistaBloqueada);
r = await como("antigo@x.com", () => q("select * from public.lesson_views"));
check("aluno não enxerga visitas de outro aluno", r.length === 0);
r = await como("admin@x.com", () => q("select * from public.lesson_views"));
check("admin enxerga as visitas", r.length === 1);
r = await como("admin@x.com", () => q("select * from public.lesson_progress"));
check("admin enxerga o progresso de todos", r.length >= 1, String(r.length));
r = await como("novo@x.com", () => q("select * from public.lesson_progress where lower(user_email) <> 'novo@x.com'"));
check("aluno continua sem ver progresso alheio", r.length === 0);

await db.exec(`insert into public.email_log (to_email, kind, subject) values ('novo@x.com', 'compra', 'Compra confirmada')`);
r = await como("novo@x.com", () => q("select * from public.email_log"));
check("aluno não enxerga o histórico de e-mails", r.length === 0);
r = await como("admin@x.com", () => q("select * from public.email_log"));
check("admin enxerga o histórico de e-mails", r.length === 1);
let logEscrita = 0;
try { logEscrita = (await como("admin@x.com", () => db.query(`delete from public.email_log`))).affectedRows ?? 0; } catch { logEscrita = 0; }
check("nem o admin apaga o histórico pelo painel", logEscrita === 0);

r = await como("novo@x.com", () => q("select * from public.admins"));
check("aluno não enxerga a lista de admins", r.length === 0);
let autoAdmin = false;
try { await como("novo@x.com", () => db.exec(`insert into public.admins (email) values ('novo@x.com')`)); } catch { autoAdmin = true; }
check("aluno não consegue se tornar admin", autoAdmin);
await como("admin@x.com", () => db.exec(`insert into public.admins (email) values ('aaron@x.com')`));
r = await como("aaron@x.com", () => q("select public.is_admin() as ok"));
check("admin adiciona o Aaron e ele passa a ser admin", r[0].ok === true);
await como("admin@x.com", () => db.exec(`delete from public.admins where email='aaron@x.com'`));
r = await como("aaron@x.com", () => q("select public.is_admin() as ok"));
check("admin remove o Aaron e ele deixa de ser admin", r[0].ok === false);

// 11) Funções do painel
r = await como("novo@x.com", () => q("select public.admin_resumen() as s"));
check("admin_resumen retorna null para quem não é admin", r[0].s === null);
r = await como("novo@x.com", () => q("select * from public.admin_alumnos()"));
check("admin_alumnos vazio para quem não é admin", r.length === 0);
r = await como("admin@x.com", () => q("select public.admin_resumen() as s"));
const rs = r[0].s;
check("admin_resumen: compras = 6", rs.compras === 6, JSON.stringify(rs));
check("admin_resumen: 1 aluno viu aula nas últimas 24 h", rs.viendo_24h === 1 && rs.viendo_7d === 1, JSON.stringify(rs));
check("admin_resumen: top_clases lidera com Aula 1.1 (2 aberturas)", rs.top_clases[0]?.title === "Aula 1.1" && rs.top_clases[0]?.vistas === 2, JSON.stringify(rs.top_clases));
check("admin_resumen: atividade recente traz o aluno e a aula", rs.actividad[0]?.email === "novo@x.com" && rs.actividad[0]?.clase === "Aula 1.1", JSON.stringify(rs.actividad));
const ativosEsperados = (await q(`select count(distinct lower(email))::int as n from public.subscriptions
  where refunded_at is null and (status='active' or (status='cancelled' and access_until is not null and access_until > now()))`))[0].n;
check("admin_resumen: ativos bate com a regra de acesso", rs.activos === ativosEsperados, `${rs.activos} vs ${ativosEsperados}`);
r = await como("admin@x.com", () => q("select * from public.admin_alumnos()"));
check("admin_alumnos: uma linha por assinatura (6)", r.length === 6, String(r.length));
const novoLinha = r.find((x) => x.email === "novo@x.com");
check("admin_alumnos: traz vistas e última vista do aluno", novoLinha?.vistas === 2 && novoLinha?.ultima_vista !== null, JSON.stringify(novoLinha));
check("admin_alumnos: reembolsado nunca tem acesso", r.filter((x) => x.refunded_at).every((x) => x.con_acceso === false));

// 12) Captura x checkout e funil
await db.exec(`insert into public.leads (email, source) values ('lista1@x.com', 'captura'), ('lista2@x.com', 'captura')`);
r = await como("admin@x.com", () => q("select public.email_stats() as s"));
check("email_stats: 2 cadastros da captura", r[0].s.captura === 2, JSON.stringify(r[0].s));
check("email_stats: quem só se cadastrou na captura não conta como pendente de carrinho", r[0].s.pendientes === s.pendientes, `${r[0].s.pendientes} vs ${s.pendientes}`);
await db.exec(`update public.leads set checkout_at = now() where email = 'lista1@x.com'`);
r = await como("admin@x.com", () => q("select public.email_stats() as s"));
check("email_stats: lead da captura que chega ao checkout passa a ser pendente de carrinho", r[0].s.pendientes === s.pendientes + 1, JSON.stringify(r[0].s));

await db.exec(`insert into public.page_events (visitor_id, path, kind, source) values
  ('v1', '/captura', 'view', 'instagram'), ('v1', '/captura', 'view', 'instagram'), ('v1', '/captura', 'lead', 'instagram'),
  ('v2', '/captura', 'view', null), ('v3', '/ventas', 'view', 'instagram'), ('v3', '/ventas', 'checkout', 'instagram')`);
let evInvalido = false;
try { await db.exec(`insert into public.page_events (visitor_id, path, kind) values ('v9', '../etc', 'view')`); } catch { evInvalido = true; }
check("page_events recusa caminho inválido", evInvalido);
r = await como("novo@x.com", () => q("select * from public.page_events"));
check("aluno não enxerga eventos de página", r.length === 0);
let escrita = false;
try { await como("novo@x.com", () => db.exec(`insert into public.page_events (visitor_id, path, kind) values ('x', '/captura', 'view')`)); } catch { escrita = true; }
check("aluno não consegue gravar eventos (só o servidor)", escrita);
r = await como("novo@x.com", () => q("select public.admin_embudo(30) as e"));
check("admin_embudo retorna null para quem não é admin", r[0].e === null);
r = await como("admin@x.com", () => q("select public.admin_embudo(30) as e"));
const emb = r[0].e;
const cap = emb.paginas.find((x) => x.path === "/captura");
const ven = emb.paginas.find((x) => x.path === "/ventas");
check("funil: /captura tem 2 visitantes únicos (v1 repetido conta uma vez) e 1 registro", cap.visitantes === 2 && cap.registros === 1, JSON.stringify(cap));
check("funil: /ventas tem 1 visitante e 1 checkout", ven.visitantes === 1 && ven.checkout === 1, JSON.stringify(ven));
const insta = emb.origenes.find((x) => x.origen === "instagram");
const directo = emb.origenes.find((x) => x.origen === "directo");
check("funil: origem instagram = 2 visitantes, 1 registro, 1 checkout", insta.visitantes === 2 && insta.registros === 1 && insta.checkout === 1, JSON.stringify(insta));
check("funil: visita sem origem aparece como 'directo'", directo?.visitantes === 1, JSON.stringify(emb.origenes));
check("funil: registros da lista = 2", emb.registros_lista === 2, JSON.stringify(emb));

// 13) Foto de perfil: cada aluno só escreve na própria pasta do bucket avatars
await db.exec(`select set_config('request.jwt.claims', '${JSON.stringify({ email: "novo@x.com", sub: "uid-novo" })}', false)`);
await db.exec("set role authenticated");
let okAvatar = true, bloqueado = false;
try { await db.exec("insert into storage.objects (bucket_id, name) values ('avatars', 'uid-novo/foto.jpg')"); } catch { okAvatar = false; }
try { await db.exec("insert into storage.objects (bucket_id, name) values ('avatars', 'uid-outro/foto.jpg')"); } catch { bloqueado = true; }
await db.exec("reset role");
check("avatar: aluno grava na própria pasta", okAvatar);
check("avatar: aluno NÃO grava na pasta de outro", bloqueado);

// 14) Pago único: vitalício (sem vencimento) e anual de 1 ano
await db.exec(`insert into public.subscriptions (email, status, plan, purchased_at, access_until, promo, hotmart_transaction)
               values ('vitalicio@x.com', 'active', 'lifetime', now() - interval '400 days', null, true, 'HP-1'),
                      ('anual@x.com', 'active', 'annual', now() - interval '10 days', now() + interval '355 days', false, 'HP-2'),
                      ('anualvencido@x.com', 'active', 'annual', now() - interval '400 days', now() - interval '35 days', false, 'HP-3')`);
r = await como("vitalicio@x.com", () => q("select is_unlocked from public.my_modules()"));
check("vitalício: acesso sem vencimento, tudo aberto", r.length === 5 && r.every((x) => x.is_unlocked));
r = await como("anual@x.com", () => q("select is_unlocked from public.my_modules()"));
check("anual dentro do ano: tem acesso", r.length === 5);
r = await como("anualvencido@x.com", () => q("select * from public.my_modules()"));
check("anual vencido: sem acesso", r.length === 0);

console.log(falhas === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
