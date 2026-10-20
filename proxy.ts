import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

const ZONAS_PROTEGIDAS = ["/aulas", "/admin"];

function aviso(mensaje: string) {
  return new NextResponse(mensaje, {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

// Renova a sessão do Supabase e protege a área de aulas e o admin.
// Nunca derruba as páginas públicas: se algo falhar na configuração, a página de venda continua abrindo.
export async function proxy(request: NextRequest) {
  // A raiz do domínio leva à etapa atual: antes do lançamento "captura", depois "ventas".
  // Troque a variável PAGINA_INICIAL na Vercel (e faça um Redeploy) no dia em que abrir as vendas.
  if (request.nextUrl.pathname === "/") {
    const etapa = process.env.PAGINA_INICIAL === "ventas" ? "/ventas" : "/captura";
    const destino = request.nextUrl.clone();
    destino.pathname = etapa;
    return NextResponse.redirect(destino);
  }

  const url = supabaseUrl();
  const key = supabaseAnonKey();
  const protegida = ZONAS_PROTEGIDAS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!url || !key) {
    if (!protegida) return NextResponse.next();
    return aviso(
      "Configuración incompleta: faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. Abrí /api/salud para ver qué falta.",
    );
  }

  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && protegida) {
      const redirect = request.nextUrl.clone();
      // O painel tem a sua própria porta de entrada; o aluno entra por /entrar.
      redirect.pathname = request.nextUrl.pathname.startsWith("/admin") ? "/equipo" : "/entrar";
      return NextResponse.redirect(redirect);
    }

    return response;
  } catch (err) {
    console.error("proxy error", err);
    if (!protegida) return NextResponse.next();
    const detalle = err instanceof Error ? err.message : "error desconocido";
    return aviso(`No se pudo conectar con Supabase (${detalle}). Abrí /api/salud para diagnosticar.`);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
