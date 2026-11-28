import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Solo para el equipo: alterna la vista previa "como alumno nuevo" (con candados por día) o
// "como alumno de US$1" (candados por contenido, igual al funil de entrada).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  const destino = new URL("/aulas", request.url);
  const res = NextResponse.redirect(destino);
  if (ok !== true) return res;
  const modo = request.nextUrl.searchParams.get("modo");
  // Siempre arranca limpio: solo una vista previa activa a la vez.
  res.cookies.delete("vista_alumno");
  res.cookies.delete("vista_trial");
  if (modo === "nuevo") {
    res.cookies.set("vista_alumno", "1", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });
  } else if (modo === "trial") {
    res.cookies.set("vista_trial", "1", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });
  }
  return res;
}
