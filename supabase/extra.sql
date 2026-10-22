-- Clase extra (bump "Cómo crecer en redes sociales como barbero"). Ejecutar una vez en el SQL Editor de Supabase.
create table if not exists public.extra_compras (
  transaction text primary key,
  email text not null,
  created_at timestamptz not null default now()
);
create index if not exists extra_compras_email_idx on public.extra_compras (lower(email));
alter table public.extra_compras enable row level security;

-- ¿El usuario logado compró la clase extra? (el admin siempre la ve abierta)
create or replace function public.tiene_extra()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.extra_compras e
    where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
grant execute on function public.tiene_extra() to authenticated;

-- Aaron como administrador del curso
insert into public.admins (email) values ('aarondallarosa08@gmail.com') on conflict do nothing;
