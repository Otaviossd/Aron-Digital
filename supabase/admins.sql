-- Cadastra quem administra o curso. Rode no SQL Editor do Supabase.
-- Pode rodar de novo sem problema: e-mails repetidos são ignorados.
--
-- Para incluir o Aaron: tire o "--" da linha dele, troque pelo e-mail que ele usa para entrar
-- com o Google e rode. Depois disso, quem já é admin também adiciona e remove pessoas
-- direto no painel (menu "Equipo").
insert into public.admins (email) values
  ('otavio.gabriel.0256@gmail.com')
  -- , ('email-do-aaron@gmail.com')
on conflict do nothing;
