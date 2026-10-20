# Site do curso digital (Aaron)

Next.js 16 + Supabase (banco, login e armazenamento das capas) + PayPal (assinaturas) + Resend (e-mail).

## O que existe

**Visual:** fonte Inter em tudo, texto em caixa normal, tema escuro minimalista com uma cor de destaque champanhe. As cores e classes comuns ficam em `app/globals.css` e `lib/ui.ts`.

**Fotos do Aaron:** coloque os arquivos em `public/aaron/` (`hero.jpg`, `sobre.jpg`, `entrar.jpg`, `aulas.jpg`; veja `public/aaron/LEEME.txt`). Sem os arquivos o site funciona com fundo escuro.

**Páginas do domínio (tudo no mesmo site):**
- `/captura`: lista de espera. A pessoa deixa o e-mail, recebe a boas-vindas e vê o botão do grupo de WhatsApp.
- `/ventas`: página de venda com o checkout. (`/vendas` redireciona para `/ventas`.)
- `/`: leva para a etapa atual. Antes do lançamento vai para `/captura`; no dia da abertura troque `PAGINA_INICIAL=ventas` na Vercel e faça um Redeploy.
- `/entrar` (alunos) e `/equipo` (time), descritas abaixo.

**Funil no painel (`/admin/embudo`):** visitantes, cadastros, chegada ao checkout e compras de cada página, por período (7, 30 ou 90 dias) e por origem. O site guarda um identificador anônimo no navegador (sem dados pessoais) e registra os eventos em `page_events`. Para saber de onde veio cada pessoa, use links com `?utm_source=...` (a aba mostra exemplos prontos). Para suas visitas não contarem, abra uma vez `/captura?rastreo=off` em cada navegador do time.

**Quem recebe e-mail de carrinho abandonado:** só quem digitou o e-mail no checkout (`/ventas`). Quem apenas se cadastrou na captura não recebe essa sequência.

**Duas portas de entrada:**
- `/entrar` é para alunos. Depois do login cai direto em `/aulas`.
- `/equipo` é para o time (você e o Aaron). Depois do login cai direto em `/admin`.
- Quem já está logado e abre qualquer uma das duas vai direto para o seu lugar, sem ver o formulário. O botão do topo da página de venda também muda ("Ir al panel" / "Ir a mis clases").
- Quem decide se a pessoa é do time é a tabela `public.admins`.

**Venda:** `/` página de venda com checkout PayPal na própria tela (mensal/anual), `/gracias` pós-compra.

**Área do aluno (`/aulas`):** menu lateral com progresso, busca, "continue de onde parou", fileiras de módulos com capas verticais (bloqueados mostram cadeado e quantos dias faltam), página do módulo, player com "marcar como concluída" e próxima aula, "Mi cuenta" (plano, datas, cancelar). Cada vez que o aluno abre uma aula isso é registrado (alimenta "viendo" no painel).

**Painel do time (`/admin`, em espanhol):**
- *Resumen:* alunos com acesso, viendo hoje/semana/mês, compras, receita mensal estimada, clases mais vistas, atividade recente, últimas compras.
- *Alumnos:* cada compra com plano, estado, progresso (clases concluídas) e última atividade.
- *Contenido:* criar/editar/apagar módulos e aulas, enviar capa, dia de liberação, agendar aulas (vídeo de toda segunda).
- *Email marketing:* estado do envio (o que falta configurar), automações (compra, carrinho abandonado, e os espaços de referidos e campanhas), histórico de envios, últimos leads e prévia de cada e-mail.
- *Equipo:* quem tem acesso ao painel; adicionar e remover pessoas.

## Domínio próprio

1. Compre o domínio (por exemplo `lanuevaera.com`) em qualquer registrador.
2. Na Vercel: Settings > Domains > Add. Siga as instruções de DNS que ela mostrar (registro A ou CNAME no registrador).
3. Na Vercel, em Environment Variables, mude `NEXT_PUBLIC_SITE_URL` para `https://seudominio.com` (sem barra no final) e, se o nome do curso for outro, `NEXT_PUBLIC_BRAND_NAME`. Faça um Redeploy.
4. No Supabase: Authentication > URL Configuration. Troque o Site URL e inclua em Redirect URLs `https://seudominio.com/auth/callback` e `https://seudominio.com/**`.
5. No Google Cloud (login com Google): nada muda, o retorno passa pelo Supabase.
6. Resend: verifique o mesmo domínio (SPF e DKIM) para os e-mails saírem de `@seudominio.com`.
7. PayPal/Hotmart: atualize a URL do webhook para o novo domínio.

## Fluxo de compra

1. Aluno escolhe o plano, digita o e-mail de acesso e paga com PayPal.
2. PayPal chama `/api/paypal/webhook` (assinatura verificada, eventos deduplicados).
3. O servidor cria o acesso e envia o e-mail de boas-vindas com link de entrada de um clique.
4. O aluno entra em `/aulas` (Google ou link mágico, sem senha).
5. Módulos com `unlock_after_days = 7` abrem sozinhos 7 dias depois da compra.

## Configuração (ordem)

1. **Supabase**: crie o projeto e rode `supabase/schema.sql` no SQL Editor (cria tabelas, regras de acesso e o bucket `covers`). Em Authentication > Providers ative Google. Em Authentication > URL Configuration troque o **Site URL** (que vem como `http://localhost:3000`) pela URL real do site e adicione em Redirect URLs `URL/auth/callback` e `URL/**`.
2. **Admins**: rode `supabase/admins.sql` no SQL Editor (já traz o seu e-mail; para o Aaron, tire o `--` da linha dele e troque pelo e-mail dele). Depois, quem já é admin adiciona outras pessoas em `/admin/equipo`.
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
- O painel (Email marketing) mostra leads, pendentes, e-mails enviados por etapa, recuperados e descadastros. "Recuperado" é quem comprou depois de receber um e-mail, e pode incluir quem compraria de qualquer forma.
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
