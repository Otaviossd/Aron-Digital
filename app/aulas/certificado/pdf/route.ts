import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generarCertificadoPdf } from "@/lib/certificado";
import { cargarFirma } from "@/lib/firma";
import { siteUrl } from "@/lib/site";

// Descarga el certificado en PDF. Solo se entrega a quien lo emitió (la política de la base lo garantiza).
// El equipo puede ver un ejemplo con ?demo=1.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.redirect(new URL("/entrar", request.url));

  let datos: { nombre: string; codigo: string; emitidoAt: string; horas: number; clases: number } | null = null;

  const { data: esAdmin } = await supabase.rpc("is_admin");
  if (esAdmin === true && request.nextUrl.searchParams.get("demo") === "1") {
    datos = { nombre: "Nombre Apellido", codigo: "LNO-DEMO-0000", emitidoAt: new Date().toISOString(), horas: 12, clases: 40 };
  } else {
    const { data: cert } = await supabase
      .from("certificados")
      .select("nombre_completo, codigo, emitido_at, horas, clases")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    if (cert) {
      datos = { nombre: cert.nombre_completo, codigo: cert.codigo, emitidoAt: cert.emitido_at, horas: Number(cert.horas), clases: cert.clases };
    }
  }
  if (!datos) return NextResponse.redirect(new URL("/aulas/certificado", request.url));

  const pdf = await generarCertificadoPdf({
    ...datos,
    urlVerificacion: `${siteUrl()}/verificar/${datos.codigo}`,
    firmaPng: await cargarFirma(),
  });

  const archivo = `Certificado-La-Nueva-Ola-${datos.nombre.normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${archivo}"`,
      "cache-control": "private, no-store",
    },
  });
}
