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
               grant execute on all functions in schema public to authenticated;`);

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
check("seed criou 3 módulos", mods.length === 3);
const [m1, m2, m3] = mods;
await db.exec(`
  insert into public.lessons (module_id, title, position) values
    ('${m1.id}', 'Aula 1.1', 1),
    ('${m3.id}', 'Aula 3.1', 1);
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
check("comprou agora: 3 módulos listados (case-insensitive no e-mail)", r.length === 3);
check("comprou agora: módulos 1 e 2 abertos, 3 fechado", r[0]?.is_unlocked && r[1]?.is_unlocked && !r[2]?.is_unlocked, JSON.stringify(r.map((x) => x.is_unlocked)));
r = await como("novo@x.com", () => q("select title from public.lessons order by title"));
check("comprou agora: vê Aula 1.1, NÃO vê a do módulo 3 nem a agendada", r.length === 1 && r[0].title === "Aula 1.1", JSON.stringify(r));

// 3) Comprou há 8 dias
await db.exec(`insert into public.subscriptions (email, paypal_subscription_id, status, purchased_at, access_until)
               values ('antigo@x.com', 'I-ANTIGO', 'active', now() - interval '8 days', now() + interval '22 days')`);
r = await como("antigo@x.com", () => q("select is_unlocked from public.my_modules()"));
check("há 8 dias: todos os módulos abertos", r.length === 3 && r.every((x) => x.is_unlocked));
r = await como("antigo@x.com", () => q("select title from public.lessons order by title"));
check("há 8 dias: vê aula do módulo 3 (mas ainda não a agendada)", r.map((x) => x.title).join() === "Aula 1.1,Aula 3.1", JSON.stringify(r));

// 4) Cancelada: acesso até fim do período pago
await db.exec(`insert into public.subscriptions (email, paypal_subscription_id, status, purchased_at, access_until)
               values ('cancelou@x.com', 'I-CANC', 'cancelled', now() - interval '10 days', now() + interval '5 days'),
                      ('venceu@x.com', 'I-VENC', 'cancelled', now() - interval '40 days', now() - interval '1 day'),
                      ('suspensa@x.com', 'I-SUSP', 'suspended', now() - interval '10 days', now() + interval '5 days')`);
r = await como("cancelou@x.com", () => q("select * from public.my_modules()"));
check("cancelada com período pago futuro: mantém acesso", r.length === 3);
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
check("admin sem compra: vê os 3 módulos abertos", r.length === 3 && r.every((x) => x.is_unlocked));
r = await como("admin@x.com", () => q("select title from public.lessons"));
check("admin vê todas as aulas (inclusive agendada)", r.length === 3, JSON.stringify(r));
r = await como("admin@x.com", () => q("select email from public.subscriptions"));
check("admin vê todas as assinaturas", r.length === 6, String(r.length));
await como("admin@x.com", () => db.exec(`insert into public.modules (title, position) values ('Novo do admin', 9)`));
check("admin cria módulo", (await q("select 1 from public.modules where title='Novo do admin'")).length === 1);

console.log(falhas === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
