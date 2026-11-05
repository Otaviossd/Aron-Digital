import { Resend } from "resend";
import { plantilla } from "@/lib/emails/abandono";
import { plantillaExtra } from "@/lib/emails/extra";
import { plantillaCaptura } from "@/lib/emails/captura";
import { siteUrl } from "@/lib/site";

const SITE_URL = siteUrl;

// Envia uma etapa da sequência. Usa um remetente de marketing separado (subdomínio) quando existe,
// para que problemas nos disparos não afetem o e-mail de confirmação de compra.
export async function enviarPasoAbandono(params: { email: string; step: number; token: string }) {
  const bajaUrl = `${SITE_URL()}/baja?t=${params.token}`;
  const { asunto, html } = plantilla(params.step, {
    siteUrl: SITE_URL(),
    email: params.email,
    bajaUrl,
    marca: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Barbería Aaron",
    ofertaFin: process.env.OFERTA_FIN || undefined,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM_MARKETING ?? process.env.EMAIL_FROM!,
    to: params.email,
    subject: asunto,
    html,
    headers: {
      // Descadastro de um clique (exigido por Gmail/Yahoo para envios em volume)
      "List-Unsubscribe": `<${SITE_URL()}/api/baja?t=${params.token}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data?.id ?? null;
}

// Envia um passo da sequência da clase extra (alunos que ainda não a compraram). Registra em email_log.
export async function enviarPasoExtra(params: { email: string; step: number; token: string; link: string; horasRestantes: number | null }) {
  const bajaUrl = `${SITE_URL()}/baja?t=${params.token}`;
  const { asunto, html } = plantillaExtra(params.step, {
    siteUrl: SITE_URL(),
    email: params.email,
    bajaUrl,
    marca: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Barbería Aaron",
    link: params.link,
    horasRestantes: params.horasRestantes,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM_MARKETING ?? process.env.EMAIL_FROM!,
    to: params.email,
    subject: asunto,
    html,
    headers: {
      "List-Unsubscribe": `<${SITE_URL()}/api/baja?t=${params.token}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return { providerId: data?.id ?? null, asunto };
}

// Envía un lote (hasta 100) de emails de la lista de espera en una sola llamada a Resend.
export type EmailCaptura = { email: string; nombre: string | null; token: string; id: string };
export async function enviarLoteCaptura(lote: EmailCaptura[]): Promise<{ providerIds: (string | null)[]; asuntos: string[] }> {
  const marca = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Barbería Aaron";
  const from = process.env.EMAIL_FROM_MARKETING ?? process.env.EMAIL_FROM!;
  const asuntos: string[] = [];
  const mensajes = lote.map((l) => {
    const { asunto, html } = plantillaCaptura(l.id, {
      siteUrl: SITE_URL(),
      email: l.email,
      nombre: l.nombre,
      bajaUrl: `${SITE_URL()}/baja?t=${l.token}`,
      marca,
    });
    asuntos.push(asunto);
    return {
      from,
      to: l.email,
      subject: asunto,
      html,
      headers: {
        "List-Unsubscribe": `<${SITE_URL()}/api/baja?t=${l.token}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.batch.send(mensajes);
  if (error) throw new Error(`Resend error: ${error.message}`);
  const ids = (data?.data ?? []).map((d) => d.id ?? null);
  return { providerIds: lote.map((_, i) => ids[i] ?? null), asuntos };
}
