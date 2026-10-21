-- Schema do site do curso digital
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute uma vez.

-- ============================================================
-- Tabelas
-- ============================================================

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  position int not null default 0,
  -- dias após a compra para o módulo abrir (0 = abre na hora, 7 = abre no dia 7)
  unlock_after_days int not null default 0 check (unlock_after_days >= 0),
  -- capa vertical (URL de imagem). Sem imagem, o site gera uma capa com a cor de destaque.
  cover_url text,
  -- cor de destaque da capa (hex), usada no fundo gerado e no brilho do cartão
  accent text not null default '#d4ff00',
  created_at timestamptz not null default now()
);

-- Bases que já rodaram a versão anterior deste arquivo:
alter table public.modules add column if not exists cover_url text;
alter table public.modules add column if not exists accent text not null default '#d4ff00';
-- bonos: aparecen en su propia fila en el área del alumno
alter table public.modules add column if not exists is_bonus boolean not null default false;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  -- URL do vídeo (Supabase Storage assinado, Bunny, Vimeo...). Trocar o host não exige mexer no site.
  video_url text,
  duration_minutes int,
  -- aula só aparece a partir desta data (usado para "vídeo novo toda segunda")
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- dias após a compra para a aula abrir (dentro de um módulo já liberado). 0 = abre com o módulo.
alter table public.lessons add column if not exists unlock_after_days int not null default 0 check (unlock_after_days >= 0);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  -- e-mail de acesso informado no checkout (custom_id do PayPal) ou e-mail do pagador
  email text not null,
  payer_email text,
  paypal_subscription_id text unique not null,
  plan text not null default 'monthly' check (plan in ('monthly', 'annual')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'suspended', 'expired')),
  purchased_at timestamptz not null default now(),
  -- fim do período já pago; cancelar não tira o acesso até esta data
  access_until timestamptz,
  -- quando o e-mail de boas-vindas foi enviado (evita duplicar)
  welcome_sent_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_email_idx on public.subscriptions (lower(email));

-- Idempotência do webhook: o PayPal reenvia eventos, não podemos processar duas vezes.
create table if not exists public.webhook_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

-- ============================================================
-- Regras de acesso
-- ============================================================

-- Quem está nesta tabela administra o curso. Cadastre o e-mail do Aaron e o seu com:
--   insert into public.admins (email) values ('seu@email.com');
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

-- Assinatura "vigente" do usuário logado (pelo e-mail do login).
create or replace function public.current_subscription()
returns public.subscriptions
language sql
stable
security definer
set search_path = public
as $$
  select s.*
  from public.subscriptions s
  where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and s.refunded_at is null
    and (
      (s.status = 'active' and (s.access_until is null or s.access_until > now()))
      or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now())
    )
  order by s.purchased_at desc
  limit 1
$$;

-- Dia em que o módulo abre para o usuário logado (null = sem assinatura).
create or replace function public.module_unlock_at(p_module_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    -- admin vê tudo liberado (para pré-visualizar o curso)
    case when public.is_admin() then now() - interval '1 second' end,
    (
      select sub.purchased_at + (m.unlock_after_days * interval '1 day')
      from public.current_subscription() sub
      where sub.id is not null
    )
  )
  from public.modules m
  where m.id = p_module_id
$$;

-- Lista os módulos com estado de bloqueio, sem expor vídeos de módulos fechados.
drop function if exists public.my_modules();
create or replace function public.my_modules()
returns table (
  id uuid,
  title text,
  description text,
  "position" int,
  unlock_after_days int,
  cover_url text,
  accent text,
  unlock_at timestamptz,
  is_unlocked boolean,
  is_bonus boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    m.title,
    m.description,
    m.position,
    m.unlock_after_days,
    m.cover_url,
    m.accent,
    public.module_unlock_at(m.id) as unlock_at,
    coalesce(public.module_unlock_at(m.id) <= now(), false) as is_unlocked,
    m.is_bonus
  from public.modules m
  where (public.current_subscription()).id is not null or public.is_admin()
  order by m.position
$$;

-- Quando uma aula abre: o que for mais tarde entre o módulo e a própria aula (dias desde a compra).
create or replace function public.lesson_unlock_at(p_lesson_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    case when public.is_admin() then now() - interval '1 second' end,
    (
      select sub.purchased_at + (greatest(m.unlock_after_days, l.unlock_after_days) * interval '1 day')
      from public.current_subscription() sub
      where sub.id is not null
    )
  )
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where l.id = p_lesson_id
$$;

-- Aulas dos módulos já liberados, com estado de bloqueio, sem expor o vídeo das bloqueadas.
drop function if exists public.my_lessons();
create or replace function public.my_lessons()
returns table (
  id uuid,
  module_id uuid,
  title text,
  description text,
  "position" int,
  duration_minutes int,
  published_at timestamptz,
  unlock_at timestamptz,
  is_unlocked boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    l.module_id,
    l.title,
    l.description,
    l.position,
    l.duration_minutes,
    l.published_at,
    public.lesson_unlock_at(l.id) as unlock_at,
    coalesce(public.lesson_unlock_at(l.id) <= now(), false) as is_unlocked
  from public.lessons l
  where ((public.current_subscription()).id is not null or public.is_admin())
    and l.published_at <= now()
    and coalesce(public.module_unlock_at(l.module_id) <= now(), false)
  order by l.position
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security;

-- Módulos: qualquer aluno com assinatura vigente vê títulos (a lista de módulos bloqueados é mostrada).
drop policy if exists "modules_select_subscriber" on public.modules;
create policy "modules_select_subscriber" on public.modules
  for select to authenticated
  using ((public.current_subscription()).id is not null);

-- Aulas: só de módulos já liberados e já publicadas.
drop policy if exists "lessons_select_unlocked" on public.lessons;
create policy "lessons_select_unlocked" on public.lessons
  for select to authenticated
  using (
    published_at <= now()
    and coalesce(public.lesson_unlock_at(id) <= now(), false)
  );

-- Assinaturas: o aluno só enxerga a própria. Escrita só pelo servidor (service role ignora RLS).
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- webhook_events: sem policy = ninguém além do service role acessa.

-- ============================================================
-- Progresso das aulas
-- ============================================================

create table if not exists public.lesson_progress (
  user_email text not null,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_email, lesson_id)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "progress_select_own" on public.lesson_progress;
create policy "progress_select_own" on public.lesson_progress
  for select to authenticated
  using (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "progress_insert_own" on public.lesson_progress;
create policy "progress_insert_own" on public.lesson_progress
  for insert to authenticated
  with check (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "progress_delete_own" on public.lesson_progress;
create policy "progress_delete_own" on public.lesson_progress
  for delete to authenticated
  using (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ============================================================
-- E-mail marketing: leads (quem digitou o e-mail no checkout) e envios
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  -- sempre em minúsculas (a API normaliza); evita duplicar o mesmo e-mail
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  plan text,
  source text,
  -- momento em que a pessoa viu o aviso de uso do e-mail e continuou
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  -- preenchido quando a compra é confirmada (para a sequência parar)
  converted_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid()
);
-- Momento em que a pessoa digitou o e-mail no checkout (a sequência de carrinho abandonado conta a
-- partir daqui). Quem só se cadastrou na página de captura fica com checkout_at nulo e NÃO recebe
-- e-mail de carrinho abandonado.
alter table public.leads add column if not exists checkout_at timestamptz;
-- Leads antigos vieram todos do checkout.
update public.leads set checkout_at = created_at where checkout_at is null and coalesce(source, 'checkout') = 'checkout';
drop index if exists public.leads_pending_idx;
create index if not exists leads_checkout_idx on public.leads (checkout_at)
  where checkout_at is not null and converted_at is null and unsubscribed_at is null;

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  sequence text not null default 'abandono',
  step int not null,
  sent_at timestamptz not null default now(),
  provider_id text,
  -- a mesma etapa nunca é enviada duas vezes para o mesmo lead
  unique (lead_id, sequence, step)
);

alter table public.leads enable row level security;
alter table public.email_sends enable row level security;
-- Sem policies para alunos: só o service role (servidor) escreve. Admin lê abaixo.

-- ============================================================
-- Administração
-- ============================================================

-- (a tabela admins e a função is_admin() ficam na seção "Regras de acesso", acima)

-- Admin gerencia módulos e aulas e enxerga tudo (inclusive módulos ainda bloqueados).
drop policy if exists "modules_admin_all" on public.modules;
create policy "modules_admin_all" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all" on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscriptions_admin_select" on public.subscriptions;
create policy "subscriptions_admin_select" on public.subscriptions
  for select to authenticated using (public.is_admin());

drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "email_sends_admin_select" on public.email_sends;
create policy "email_sends_admin_select" on public.email_sends
  for select to authenticated using (public.is_admin());

-- Números do e-mail marketing para o painel (só admin; para os demais retorna null).
create or replace function public.email_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'leads', (select count(*) from public.leads),
    'captura', (select count(*) from public.leads where source = 'captura'),
    'pendientes', (select count(*) from public.leads where checkout_at is not null and converted_at is null and unsubscribed_at is null),
    'bajas', (select count(*) from public.leads where unsubscribed_at is not null),
    'enviados', (
      select coalesce(jsonb_object_agg(step::text, n), '{}'::jsonb)
      from (select step, count(*) as n from public.email_sends group by step) s
    ),
    -- recuperados: compraram depois de receber pelo menos um e-mail da sequência
    'recuperados', (
      select count(*) from public.leads l
      where l.converted_at is not null
        and exists (select 1 from public.email_sends e where e.lead_id = l.id and e.sent_at < l.converted_at)
    )
  )
  where public.is_admin()
$$;

-- ============================================================
-- Atividade dos alunos (quem está assistindo) e histórico de e-mails
-- ============================================================

-- Cada vez que o aluno abre uma aula, registramos a visita. Serve para o painel mostrar
-- "quantos alunos estão assistindo" (aberturas de aula), que é diferente de "aula concluída".
create table if not exists public.lesson_views (
  user_email text not null,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  views int not null default 1,
  primary key (user_email, lesson_id)
);
alter table public.lesson_views enable row level security;

drop policy if exists "views_select_own" on public.lesson_views;
create policy "views_select_own" on public.lesson_views
  for select to authenticated
  using (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Só registra visita de aulas que o aluno realmente enxerga (a RLS de lessons vale dentro do exists).
drop policy if exists "views_insert_own" on public.lesson_views;
create policy "views_insert_own" on public.lesson_views
  for insert to authenticated
  with check (
    lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and exists (select 1 from public.lessons l where l.id = lesson_id)
  );

drop policy if exists "views_update_own" on public.lesson_views;
create policy "views_update_own" on public.lesson_views
  for update to authenticated
  using (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "views_admin_select" on public.lesson_views;
create policy "views_admin_select" on public.lesson_views
  for select to authenticated using (public.is_admin());

-- security invoker: roda com os direitos do aluno, então as policies acima se aplicam.
create or replace function public.registrar_vista(p_lesson_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.lesson_views (user_email, lesson_id)
  values (lower(coalesce(auth.jwt() ->> 'email', '')), p_lesson_id)
  on conflict (user_email, lesson_id) do update
    set last_viewed_at = now(), views = public.lesson_views.views + 1
$$;

-- Admin enxerga o progresso de todos os alunos (tabela de alunos do painel).
drop policy if exists "progress_admin_select" on public.lesson_progress;
create policy "progress_admin_select" on public.lesson_progress
  for select to authenticated using (public.is_admin());

-- Histórico dos e-mails transacionais (confirmação de compra, etc.). A sequência de carrinho
-- abandonado continua em email_sends. Só o servidor escreve; admin lê.
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  kind text not null,
  subject text,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error text,
  provider_id text,
  created_at timestamptz not null default now()
);
create index if not exists email_log_created_idx on public.email_log (created_at desc);
alter table public.email_log enable row level security;

drop policy if exists "email_log_admin_select" on public.email_log;
create policy "email_log_admin_select" on public.email_log
  for select to authenticated using (public.is_admin());

-- Equipe: quem já é admin pode ver, adicionar e remover admins pelo painel.
-- (O primeiro admin é cadastrado pelo SQL Editor: veja supabase/admins.sql.)
drop policy if exists "admins_admin_select" on public.admins;
create policy "admins_admin_select" on public.admins
  for select to authenticated using (public.is_admin());

drop policy if exists "admins_admin_insert" on public.admins;
create policy "admins_admin_insert" on public.admins
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins_admin_delete" on public.admins;
create policy "admins_admin_delete" on public.admins
  for delete to authenticated using (public.is_admin());

-- Números do painel (só admin; para os demais retornam null / vazio). Feitos em SQL para não
-- esbarrar no limite de linhas da API quando houver muitos alunos.
create or replace function public.admin_resumen()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with con_acceso as (
    select distinct on (lower(s.email)) lower(s.email) as email, s.plan
    from public.subscriptions s
    where s.refunded_at is null
      and ((s.status = 'active' and (s.access_until is null or s.access_until > now())) or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now()))
    order by lower(s.email), s.purchased_at desc
  )
  select jsonb_build_object(
    'activos', (select count(*) from con_acceso),
    'activos_mensual', (select count(*) from con_acceso where plan = 'monthly'),
    'activos_anual', (select count(*) from con_acceso where plan = 'annual'),
    'activos_vitalicio', (select count(*) from con_acceso where plan = 'lifetime'),
    'compras', (select count(*) from public.subscriptions),
    'compras_7d', (select count(*) from public.subscriptions where purchased_at > now() - interval '7 days'),
    'reembolsos', (select count(*) from public.subscriptions where refunded_at is not null),
    'viendo_24h', (select count(distinct lower(user_email)) from public.lesson_views where last_viewed_at > now() - interval '24 hours'),
    'viendo_7d', (select count(distinct lower(user_email)) from public.lesson_views where last_viewed_at > now() - interval '7 days'),
    'viendo_30d', (select count(distinct lower(user_email)) from public.lesson_views where last_viewed_at > now() - interval '30 days'),
    'vistas', (select coalesce(sum(views), 0) from public.lesson_views),
    'completadas', (select count(*) from public.lesson_progress),
    'aulas', (select count(*) from public.lessons where published_at <= now()),
    'modulos', (select count(*) from public.modules),
    'top_clases', (
      select coalesce(jsonb_agg(t order by t.vistas desc), '[]'::jsonb) from (
        select l.title, sum(v.views)::int as vistas, count(*)::int as alumnos
        from public.lesson_views v join public.lessons l on l.id = v.lesson_id
        group by l.id, l.title order by sum(v.views) desc limit 5
      ) t
    ),
    'actividad', (
      select coalesce(jsonb_agg(t order by t.cuando desc), '[]'::jsonb) from (
        select v.user_email as email, l.title as clase, v.last_viewed_at as cuando
        from public.lesson_views v join public.lessons l on l.id = v.lesson_id
        order by v.last_viewed_at desc limit 8
      ) t
    )
  )
  where public.is_admin()
$$;

-- Uma linha por assinatura, com o progresso e a última atividade do aluno.
create or replace function public.admin_alumnos()
returns table (
  email text, plan text, status text, purchased_at timestamptz, access_until timestamptz,
  refunded_at timestamptz, con_acceso boolean, completadas int, vistas int, ultima_vista timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.email, s.plan, s.status, s.purchased_at, s.access_until, s.refunded_at,
    (s.refunded_at is null and ((s.status = 'active' and (s.access_until is null or s.access_until > now())) or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now()))),
    (select count(*)::int from public.lesson_progress p where lower(p.user_email) = lower(s.email)),
    (select coalesce(sum(v.views), 0)::int from public.lesson_views v where lower(v.user_email) = lower(s.email)),
    (select max(v.last_viewed_at) from public.lesson_views v where lower(v.user_email) = lower(s.email))
  from public.subscriptions s
  where public.is_admin()
  order by s.purchased_at desc
  limit 1000
$$;

-- ============================================================
-- Funil: visitas às páginas (rastreio próprio, sem cookies de terceiros)
-- ============================================================

-- Uma linha por evento. Só o servidor grava (service role); admin lê.
create table if not exists public.page_events (
  id bigint generated always as identity primary key,
  visitor_id text not null check (char_length(visitor_id) <= 64),
  path text not null check (path ~ '^/[a-z0-9/_-]{0,60}$'),
  kind text not null check (kind in ('view', 'lead', 'checkout')),
  -- origem da visita: utm_source ou domínio de quem indicou (vazio = direto)
  source text check (char_length(source) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists page_events_created_idx on public.page_events (created_at desc);
create index if not exists page_events_path_kind_idx on public.page_events (path, kind, created_at desc);
alter table public.page_events enable row level security;

drop policy if exists "page_events_admin_select" on public.page_events;
create policy "page_events_admin_select" on public.page_events
  for select to authenticated using (public.is_admin());

-- Funil dos últimos p_days dias: por página, por origem e totais (só admin).
create or replace function public.admin_embudo(p_days int default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with ev as (
    select * from public.page_events
    where created_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
  )
  select jsonb_build_object(
    'paginas', (
      select coalesce(jsonb_agg(t order by t.path), '[]'::jsonb) from (
        select path,
          (count(distinct visitor_id) filter (where kind = 'view'))::int as visitantes,
          (count(distinct visitor_id) filter (where kind = 'lead'))::int as registros,
          (count(distinct visitor_id) filter (where kind = 'checkout'))::int as checkout
        from ev group by path
      ) t
    ),
    'origenes', (
      select coalesce(jsonb_agg(t order by t.visitantes desc), '[]'::jsonb) from (
        select coalesce(nullif(source, ''), 'directo') as origen,
          (count(distinct visitor_id) filter (where kind = 'view'))::int as visitantes,
          (count(distinct visitor_id) filter (where kind = 'lead'))::int as registros,
          (count(distinct visitor_id) filter (where kind = 'checkout'))::int as checkout
        from ev group by 1 order by 2 desc limit 10
      ) t
    ),
    'registros_lista', (
      select count(*) from public.leads
      where source = 'captura' and created_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
    ),
    'compras', (
      select count(*) from public.subscriptions
      where purchased_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
    )
  )
  where public.is_admin()
$$;

-- ============================================================
-- Storage das capas (bucket público para leitura; só admin envia)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers_admin_write" on storage.objects;
create policy "covers_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());

-- ============================================================
-- Exemplo de conteúdo (apague e cadastre os módulos reais do Aaron)
-- ============================================================

insert into public.modules (title, description, position, unlock_after_days)
select * from (values
  ('Módulo 1: Fundamentos', 'Ferramentas, postura e primeiros cortes', 1, 0),
  ('Módulo 2: Degradê', 'Técnica de degradê passo a passo', 2, 0),
  ('Módulo 3: Avançado', 'Acabamentos e atendimento premium', 3, 7)
) as v(title, description, position, unlock_after_days)
where not exists (select 1 from public.modules);

-- ============================================================
-- Foto de perfil do aluno (bucket público; cada aluno só escreve na própria pasta)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_own_write" on storage.objects;
create policy "avatars_own_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and split_part(name, '/', 1) = coalesce(auth.jwt() ->> 'sub', ''))
  with check (bucket_id = 'avatars' and split_part(name, '/', 1) = coalesce(auth.jwt() ->> 'sub', ''));

-- ============================================================
-- Bono de lanzamiento: módulo de Color (se abre al día 7). Edita o agrega más desde /admin/contenido.
-- ============================================================

insert into public.modules (title, description, position, unlock_after_days, is_bonus)
select 'Bono: Color', 'Técnicas de color para barberos. Se libera a los 7 días de tu acceso.', 100, 7, true
where not exists (select 1 from public.modules where is_bonus and title = 'Bono: Color');


-- ============================================================
-- Pago único (Hotmart): acceso de 1 año o vitalicio. Reemplaza el modelo de suscripción mensual.
-- plan 'annual'   = 1 año (access_until = compra + 365 días)
-- plan 'lifetime' = vitalicio (access_until nulo = no vence)
-- promo = true marca a las primeras personas que compraron con el precio de lanzamiento.
-- ============================================================

alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check check (plan in ('monthly', 'annual', 'lifetime'));
alter table public.subscriptions alter column paypal_subscription_id drop not null;
alter table public.subscriptions add column if not exists hotmart_transaction text unique;
alter table public.subscriptions add column if not exists promo boolean not null default false;

-- Contacto que la persona deja antes de ver la oferta en /ventas
alter table public.leads add column if not exists name text;
alter table public.leads add column if not exists phone text;
