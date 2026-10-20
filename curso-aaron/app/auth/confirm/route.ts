import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rutaInicial } from "@/lib/destino";

// Entrada de um clique pelo e-mail de compra (token gerado no servidor).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && type === "magiclink") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${await rutaInicial(supabase)}`);
  }

  return NextResponse.redirect(`${origin}/entrar?error=1`);
}
