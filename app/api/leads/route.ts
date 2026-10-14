import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Guarda o e-mail digitado no checkout (antes de pagar) para a sequência de carrinho abandonado.
// Responde sempre 200 com o mesmo corpo: não revela se o e-mail já existia.
export async function POST(request: NextRequest) {
  let body: { email?: unknown; plan?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = body.plan === "annual" ? "annual" : "monthly";
  if (!EMAIL_RE.test(email) || email.length > 254) return NextResponse.json({ ok: true });

  try {
    // upsert só atualiza plano/origem; nunca mexe em created_at, converted_at nem unsubscribed_at
    await createAdminClient()
      .from("leads")
      .upsert({ email, plan, source: "checkout" }, { onConflict: "email" });
  } catch (err) {
    console.error("lead error", err);
  }
  return NextResponse.json({ ok: true });
}
