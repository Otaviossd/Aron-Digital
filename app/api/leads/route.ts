import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarBienvenidaLista } from "@/lib/lista";
import { normalizarTelefono } from "@/lib/telefono";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Guarda o e-mail de quem deixou o contato:
// - source "checkout": digitou o e-mail na página de venda (antes de pagar). Começa o relógio do
//   carrinho abandonado (checkout_at), uma única vez.
// - source "captura": se cadastrou na lista de espera. Não recebe e-mail de carrinho abandonado;
//   recebe só a boas-vindas.
// Responde sempre 200 com o mesmo corpo: não revela se o e-mail já existia.
export async function POST(request: NextRequest) {
  let body: { email?: unknown; plan?: unknown; source?: unknown; name?: unknown; phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = body.plan === "anual" || body.plan === "vitalicio" || body.plan === "promo" ? body.plan : null;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) || null : null;
  // Solo se guarda un WhatsApp con código de país real; si no, queda vacío (no ensucia la lista).
  const telNormal = typeof body.phone === "string" ? normalizarTelefono(body.phone) : null;
  const phone = telNormal ? `+${telNormal}` : null;
  const source = body.source === "captura" ? "captura" : "checkout";
  if (!EMAIL_RE.test(email) || email.length > 254) return NextResponse.json({ ok: true });

  try {
    const admin = createAdminClient();
    const ahora = new Date().toISOString();
    const { data: existente } = await admin
      .from("leads")
      .select("id, checkout_at, unsubscribe_token")
      .eq("email", email)
      .maybeSingle();

    if (!existente) {
      const { data: nuevo, error } = await admin
        .from("leads")
        .insert({
          email,
          plan: source === "checkout" ? plan : null,
          name,
          phone,
          source,
          checkout_at: source === "checkout" ? ahora : null,
        })
        .select("unsubscribe_token")
        .single();
      if (error) throw error;
      // Só a primeira vez que o e-mail entra na lista recebe a boas-vindas (evita repetir se enviar de novo)
      if (source === "captura" && nuevo) await enviarBienvenidaLista({ email, token: nuevo.unsubscribe_token });
    } else if (source === "checkout") {
      // Atualiza plano/contato e inicia o relógio do carrinho só se ainda não tinha começado.
      // Nunca mexe em created_at, converted_at, unsubscribed_at nem na origem original.
      await admin
        .from("leads")
        .update({
          ...(plan ? { plan } : {}),
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          ...(existente.checkout_at ? {} : { checkout_at: ahora }),
        })
        .eq("id", existente.id);
    }
  } catch (err) {
    console.error("lead error", err);
  }
  return NextResponse.json({ ok: true });
}
