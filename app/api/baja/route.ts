import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function darDeBaja(token: string | null) {
  if (!token || !UUID_RE.test(token)) return false;
  const { error } = await createAdminClient()
    .from("leads")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .is("unsubscribed_at", null);
  return !error;
}

// Descadastro de um clique (cabeçalho List-Unsubscribe-Post dos clientes de e-mail) e botão da página /baja.
export async function POST(request: NextRequest) {
  let token = request.nextUrl.searchParams.get("t");
  if (!token) {
    try {
      const form = await request.formData();
      const t = form.get("t");
      token = typeof t === "string" ? t : null;
    } catch {
      token = null;
    }
  }
  const ok = await darDeBaja(token);

  // Formulário da página: volta para a página de confirmação. Cliente de e-mail: 200 simples.
  const vieneDeForm = (request.headers.get("content-type") ?? "").includes("form");
  if (vieneDeForm && request.nextUrl.searchParams.get("t") === null) {
    return NextResponse.redirect(new URL(ok ? "/baja?ok=1" : "/baja?error=1", request.url), { status: 303 });
  }
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
