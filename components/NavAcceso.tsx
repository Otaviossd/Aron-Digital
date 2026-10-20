import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rutaInicial } from "@/lib/destino";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

// Link do topo da página de venda. Quem já tem sessão vai direto para o seu lugar.
export default async function NavAcceso() {
  let destino: "/admin" | "/aulas" | null = null;
  if (supabaseUrl() && supabaseAnonKey()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) destino = await rutaInicial(supabase);
    } catch {
      destino = null; // a página de venda nunca pode quebrar por causa do login
    }
  }

  return destino ? (
    <Link href={destino} className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-white/5">
      {destino === "/admin" ? "Ir al panel" : "Ir a mis clases"}
    </Link>
  ) : (
    <Link href="/entrar" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-white/5">
      Acceder
    </Link>
  );
}
