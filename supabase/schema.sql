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
      s.status = 'active'
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
  is_unlocked boolean
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
    coalesce(public.module_unlock_at(m.id) <= now(), false) as is_unlocked
  from public.modules m
  where (public.current_subscription()).id is not null or public.is_admin()
  order by m.position
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
    and coalesce(public.module_unlock_at(module_id) <= now(), false)
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
create index if not exists leads_pending_idx on public.leads (created_at)
  where converted_at is null and unsubscribed_at is null;

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
    'pendientes', (select count(*) from public.leads where converted_at is null and unsubscribed_at is null),
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
