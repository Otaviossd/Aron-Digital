import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND, WHATSAPP_GRUPO_URL } from "@/lib/config";
import { ASUNTO_LISTA, htmlLista } from "@/lib/emails/lista";
import { siteUrl } from "@/lib/site";

const SITE_URL = siteUrl;

// Envia o e-mail de boas-vindas da lista de espera. Se o envio de e-mail ainda não estiver
// configurado, não faz nada (o cadastro não pode falhar por isso). Cada tentativa vai para email_log.
export async function enviarBienvenidaLista(params: { email: string; token: string }) {
  const from = process.env.EMAIL_FROM_MARKETING ?? process.env.EMAIL_FROM;
  if (!process.env.RESEND_API_KEY || !from) return;

  const admin = createAdminClient();
  const registrar = async (fila: { status: "sent" | "failed"; provider_id?: string | null; error?: string | null }) => {
    try {
      await admin.from("email_log").insert({ to_email: params.email, kind: "lista", subject: ASUNTO_LISTA, ...fila });
    } catch {
      /* o registro nunca derruba o envio */
    }
  };

  try {
    const bajaUrl = `${SITE_URL()}/baja?t=${params.token}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to: params.email,
      subject: ASUNTO_LISTA,
      html: htmlLista({ whatsappUrl: WHATSAPP_GRUPO_URL, bajaUrl, marca: BRAND }),
      headers: {
        "List-Unsubscribe": `<${SITE_URL()}/api/baja?t=${params.token}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    await registrar({ status: "sent", provider_id: data?.id ?? null });
  } catch (err) {
    console.error("bienvenida lista falló", err);
    await registrar({ status: "failed", error: err instanceof Error ? err.message.slice(0, 300) : "error" });
  }
}
