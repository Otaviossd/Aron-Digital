import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Solo para el equipo: alterna la vista previa "como alumno nuevo" (con candados).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  const destino = new URL("/aulas", request.url);
  const res = NextResponse.redirect(destino);
  if (ok !== true) return res;
  if (request.nextUrl.searchParams.get("modo") === "nuevo") {
    res.cookies.set("vista_alumno", "1", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });
  } else {
    res.cookies.delete("vista_alumno");
  }
  return res;
}
