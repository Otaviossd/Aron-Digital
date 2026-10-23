import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { ASUNTO_COMPRA, htmlCompra } from "@/lib/emails/compra";

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Gera um link de acesso de um clique (válido por tempo limitado) e envia o e-mail de boas-vindas.
// Cada tentativa fica registrada em email_log (aparece no painel, em Email > Historial).
export async function sendWelcomeEmail(params: { to: string; plan: "monthly" | "annual" | "lifetime" }) {
  const admin = createAdminClient();
  const registrar = async (fila: { status: "sent" | "failed"; provider_id?: string | null; error?: string | null }) => {
    // O registro nunca pode impedir nem derrubar o envio.
    try {
      await admin.from("email_log").insert({ to_email: params.to, kind: "compra", subject: ASUNTO_COMPRA, ...fila });
    } catch {
      /* ignora */
    }
  };

  try {
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: params.to });
    if (error) throw error;

    const hashed = data.properties.hashed_token;
    const accessLink = `${SITE_URL()}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=magiclink`;
    const loginLink = `${SITE_URL()}/entrar`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: enviado, error: sendError } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: params.to,
      subject: ASUNTO_COMPRA,
      html: htmlCompra({ accessLink, loginLink, to: params.to, plan: params.plan, codigo: data.properties.email_otp }),
    });
    if (sendError) throw new Error(`Resend error: ${sendError.message}`);
    await registrar({ status: "sent", provider_id: enviado?.id ?? null });
  } catch (err) {
    await registrar({ status: "failed", error: err instanceof Error ? err.message.slice(0, 300) : "error" });
    throw err;
  }
}
