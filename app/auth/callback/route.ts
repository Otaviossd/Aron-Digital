import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rutaInicial } from "@/lib/destino";

// Recebe o retorno do login com Google e do link mágico enviado por e-mail.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${await rutaInicial(supabase)}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=1`);
}
