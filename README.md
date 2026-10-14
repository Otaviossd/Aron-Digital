# Site do curso digital (Aaron)

Next.js 16 + Supabase (banco, login e armazenamento das capas) + PayPal (assinaturas) + Resend (e-mail).

## O que existe

**Venda:** `/` página de venda com checkout PayPal na própria tela (mensal/anual), `/gracias` pós-compra.

**Área do aluno (`/aulas`):** menu lateral com progresso, busca, "continue de onde parou", fileiras de módulos com capas verticais (bloqueados mostram cadeado e quantos dias faltam), página do módulo, player com "marcar como concluída" e próxima aula, "Mi cuenta" (plano, datas, cancelar).

**Admin (`/admin`):** criar/editar/apagar módulos e aulas, enviar capa (arquivo ou URL), definir o dia de liberação do módulo, agendar aulas (vídeo de toda segunda), ver alunos e status.

## Fluxo de compra

1. Aluno escolhe o plano, digita o e-mail de acesso e paga com PayPal.
2. PayPal chama `/api/paypal/webhook` (assinatura verificada, eventos deduplicados).
3. O servidor cria o acesso e envia o e-mail de boas-vindas com link de entrada de um clique.
4. O aluno entra em `/aulas` (Google ou link mágico, sem senha).
5. Módulos com `unlock_after_days = 7` abrem sozinhos 7 dias depois da compra.

## Configuração (ordem)

1. **Supabase**: crie o projeto e rode `supabase/schema.sql` no SQL Editor (cria tabelas, regras de acesso e o bucket `covers`). Em Authentication > Providers ative Google. Em Authentication > URL Configuration adicione a URL do site e `URL/auth/callback`.
2. **Admins**: no SQL Editor, `insert into public.admins (email) values ('seu@email.com'), ('email-do-aaron@email.com');`
3. **PayPal**: crie o app (sandbox primeiro) e dois planos de assinatura (mensal e anual) com os valores de `lib/config.ts`. Crie um webhook para `URL/api/paypal/webhook` com os eventos `BILLING.SUBSCRIPTION.ACTIVATED`, `.CANCELLED`, `.EXPIRED`, `.SUSPENDED`, `PAYMENT.SALE.COMPLETED` e `PAYMENT.SALE.REFUNDED`.
4. **Resend**: verifique o domínio de envio e gere a API key.
5. Copie `.env.example` para `.env.local` e preencha tudo.
6. `npm install && npm run dev`. Teste uma compra no sandbox do início ao fim.

## Capas dos módulos

Formato vertical 3:4 (sugestão: 900x1200 px). Envie pelo `/admin` ou cole uma URL. Sem imagem, o site gera uma capa com número grande e a cor de destaque do módulo. A tag "MÓDULO N" e o título são desenhados pelo site em cima da imagem, então **não coloque texto na arte**.

## E-mails de carrinho abandonado

- O checkout guarda o e-mail quando a pessoa termina de digitar (aviso de uso embaixo do campo) como **lead**.
- A cada hora, o GitHub Actions (`.github/workflows/cron-abandonados.yml`) chama `/api/cron/abandonados`. Cada lead recebe, no máximo, 3 e-mails: 1 h, 24 h e 48 h depois. Quem compra ou se descadastra para de receber na hora; passados 7 dias, o lead é considerado frio.
- Configure no GitHub os segredos `SITE_URL` e `CRON_SECRET` (o mesmo valor da Vercel). O cron da Vercel no plano gratuito roda só 1x por dia, por isso o agendador é externo.
- Textos em `lib/emails/abandono.ts`. Não há desconto nem urgência inventada; o prazo só aparece se `OFERTA_FIN` estiver preenchido.
- O `/admin` mostra leads, pendentes, e-mails enviados por etapa, recuperados e descadastros. "Recuperado" é quem comprou depois de receber um e-mail, e pode incluir quem compraria de qualquer forma.
- Cuidado: como o e-mail vem de um campo aberto, alguém pode digitar o e-mail de outra pessoa. Por isso há descadastro de um clique e no máximo 3 e-mails por pessoa.
- Antes de disparar: verifique o domínio no Resend (SPF e DKIM) e use um subdomínio para marketing.

## Reembolso

O reembolso dentro de 7 dias é feito manualmente no painel do PayPal. O webhook `PAYMENT.SALE.REFUNDED` encerra o acesso sozinho. O botão do aluno cancela apenas as próximas cobranças e mantém o acesso até o fim do período pago.

## Testes

- `node --test lib/sequence.test.ts` confere a regra da sequência (quando cada e-mail sai, quando para).
- `npm i -D @electric-sql/pglite && node supabase/test-rules.mjs` roda o `schema.sql` num Postgres em memória e confere: abertura do módulo no dia 7, cancelada/suspensa/reembolsada, aulas agendadas, isolamento entre alunos, permissões de admin, leads e estatísticas de e-mail.

## Diagnóstico: `/api/salud`

Abra `https://SEU-SITE/api/salud`. A página lista cada variável como `ok`, `FALTA` ou `formato raro` (nunca mostra os valores) e testa de verdade a conexão com o banco, a chave `service_role` e se o `schema.sql` foi executado. É o primeiro lugar para olhar se algo não funciona. Depois que tudo estiver rodando, você pode apagar a pasta `app/api/salud`.

## Se aparecer "Internal Server Error"

Quase sempre falta ou está errada uma variável de ambiente (na Vercel: Settings > Environment Variables, e depois um novo deploy). O site tolera espaços, aspas e vírgula sobrando nos valores, e a página de venda abre mesmo sem configuração. `/aulas` e `/admin` explicam o que falta. Se o erro persistir, abra `/api/salud`; se nem ela abrir, veja os logs do deploy na Vercel (Deployments > Logs).

## Antes de publicar

- Defina os preços reais em `lib/config.ts` e nos planos do PayPal.
- Troque os módulos de exemplo pelos reais (pelo `/admin`).
- Revise com contador/advogado os termos de reembolso por país.
- Para muitos alunos assistindo ao mesmo tempo, considere trocar o host de vídeo (Bunny Stream ou Vimeo). O campo de vídeo aceita qualquer URL.
