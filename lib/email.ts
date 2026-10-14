import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Gera um link de acesso de um clique (válido por tempo limitado) e envia o e-mail de boas-vindas.
export async function sendWelcomeEmail(params: { to: string; plan: "monthly" | "annual" }) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: params.to,
  });
  if (error) throw error;

  const hashed = data.properties.hashed_token;
  const accessLink = `${SITE_URL()}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=magiclink`;
  const loginLink = `${SITE_URL()}/entrar`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: sendError } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: params.to,
    subject: "Compra confirmada: tu acceso al curso",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h1 style="font-size:24px;margin:0 0 12px">¡Compra confirmada!</h1>
        <p>Gracias por sumarte. Tu acceso ya está activo.</p>
        <p style="margin:24px 0">
          <a href="${accessLink}" style="background:#d4ff00;color:#000;padding:14px 22px;font-weight:bold;text-decoration:none;display:inline-block">
            ENTRAR AL CURSO
          </a>
        </p>
        <p style="font-size:14px;color:#444">
          Este botón entra con un solo clic y vence en poco tiempo. Si venció, entrá siempre desde
          <a href="${loginLink}">${loginLink}</a> con este mismo email (${params.to}) o con Google.
        </p>
        <p style="font-size:14px;color:#444">
          Algunos módulos se liberan automáticamente a los 7 días de tu compra. Podés cancelar la
          suscripción cuando quieras desde tu cuenta; el reembolso solo está disponible durante los
          primeros 7 días.
        </p>
      </div>`,
  });
  if (sendError) throw new Error(`Resend error: ${sendError.message}`);
}
