-- Emails de la clase extra para quien compró el curso y no la compró. Ejecutar una vez en el SQL Editor de Supabase.
create table if not exists public.extra_sends (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  step int not null,
  sent_at timestamptz not null default now(),
  provider_id text,
  -- el mismo paso nunca se manda dos veces al mismo email
  unique (email, step)
);
alter table public.extra_sends enable row level security;
-- Sin policies para alumnos: solo el servidor (service role) escribe. El equipo lee:
drop policy if exists "extra_sends_admin_select" on public.extra_sends;
create policy "extra_sends_admin_select" on public.extra_sends
  for select to authenticated using (public.is_admin());
