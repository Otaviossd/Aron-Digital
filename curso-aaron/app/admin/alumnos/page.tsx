import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { estadoAlumno, fmtFecha, hace, type AlumnoAdmin } from "@/lib/admin";
import { Dato, Pildora, Tabla, Titulo, Vacio } from "@/components/admin/ui";

const ahoraISO = () => new Date().toISOString();
const dentroDeSemana = (fecha: string | null) => Boolean(fecha) && Date.now() - new Date(fecha as string).getTime() < 7 * 86400000;

export default function AlumnosPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Alumnos />
    </Suspense>
  );
}

async function Alumnos() {
  const supabase = await createClient();
  const [{ data }, { count: totalAulas }] = await Promise.all([
    supabase.rpc("admin_alumnos"),
    supabase.from("lessons").select("id", { count: "exact", head: true }).lte("published_at", ahoraISO()),
  ]);
  const alumnos = (data ?? []) as AlumnoAdmin[];
  const total = totalAulas ?? 0;

  const conAcceso = alumnos.filter((a) => a.con_acceso).length;
  const semana = alumnos.filter((a) => dentroDeSemana(a.ultima_vista)).length;
  const sinEntrar = alumnos.filter((a) => a.con_acceso && !a.ultima_vista).length;

  return (
    <>
      <Titulo titulo="Alumnos" sub="Quién compró, quién está viendo el curso y hasta dónde llegó cada uno." />

      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato valor={alumnos.length} etiqueta="Compras" />
        <Dato valor={conAcceso} etiqueta="Con acceso" />
        <Dato valor={semana} etiqueta="Activos esta semana" />
        <Dato valor={sinEntrar} etiqueta="Compraron y nunca entraron" nota="Buenos para un recordatorio" />
      </div>

      {alumnos.length === 0 ? (
        <Vacio>Todavía no hay compras. Cuando entre la primera, aparece acá con su progreso.</Vacio>
      ) : (
        <Tabla cabeceras={["Email", "Plan", "Estado", "Compra", "Progreso", "Última actividad"]}>
          {alumnos.map((a) => {
            const pct = total === 0 ? 0 : Math.min(100, Math.round((a.completadas / total) * 100));
            const estado = estadoAlumno(a);
            return (
              <tr key={a.email + a.purchased_at}>
                <td className="px-4 py-3 font-medium">{a.email}</td>
                <td className="px-4 py-3 text-muted">{a.plan === "annual" ? "Anual" : "Mensual"}</td>
                <td className="px-4 py-3">
                  <Pildora tono={a.con_acceso ? "ok" : a.refunded_at ? "error" : "neutro"}>{estado}</Pildora>
                </td>
                <td className="px-4 py-3 text-muted">{fmtFecha(a.purchased_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-20 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted">
                      {a.completadas}/{total}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{a.ultima_vista ? hace(a.ultima_vista) : "Nunca entró"}</td>
              </tr>
            );
          })}
        </Tabla>
      )}
      {alumnos.length >= 1000 && <p className="mt-3 text-xs text-faint">Mostrando las 1.000 compras más recientes.</p>}
    </>
  );
}
