import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PRECOS } from "@/lib/config";
import { estadoConfig, fmtFecha, hace, type ResumenAdmin } from "@/lib/admin";
import { Dato, Seccion, Tabla, Titulo, Vacio } from "@/components/admin/ui";

export default function AdminResumenPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Resumen />
    </Suspense>
  );
}

async function Resumen() {
  const supabase = await createClient();
  const [{ data: r }, { data: ultimas }] = await Promise.all([
    supabase.rpc("admin_resumen"),
    supabase.from("subscriptions").select("email, plan, status, purchased_at, refunded_at").order("purchased_at", { ascending: false }).limit(6),
  ]);
  const res = (r ?? null) as ResumenAdmin | null;
  if (!res) return <Vacio>No pudimos leer los números. Ejecutá de nuevo supabase/schema.sql en el SQL Editor y recargá.</Vacio>;

  const mrr = Math.round(res.activos_mensual * PRECOS.monthly.valor + (res.activos_anual * PRECOS.annual.valor) / 12);
  const config = estadoConfig();
  const pendientes = [...config.pagos, ...config.email, ...config.sitio].filter((c) => !c.ok && !("opcional" in c && c.opcional));

  return (
    <>
      <Titulo titulo="Resumen" sub="Cómo va el curso hoy: alumnos, actividad y ventas." />

      {pendientes.length > 0 && (
        <div className="mb-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
          <p className="text-sm font-medium text-amber-200">Falta terminar la configuración</p>
          <p className="mt-1 text-sm text-muted">
            {pendientes.map((p) => p.etiqueta).join(" · ")}.{" "}
            <Link href="/admin/email" className="text-ink underline underline-offset-4">
              Ver detalle
            </Link>
          </p>
        </div>
      )}

      <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato valor={res.activos} etiqueta="Alumnos con acceso" nota={`${res.activos_mensual} mensual · ${res.activos_anual} anual`} />
        <Dato valor={res.viendo_7d} etiqueta="Viendo esta semana" nota={`${res.viendo_24h} en las últimas 24 h · ${res.viendo_30d} en 30 días`} />
        <Dato valor={res.compras_7d} etiqueta="Compras en 7 días" nota={`${res.compras} en total`} />
        <Dato valor={`US$${mrr}`} etiqueta="Ingreso mensual estimado" nota="Según los precios de lib/config.ts" />
      </div>

      <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato valor={res.vistas} etiqueta="Clases abiertas" />
        <Dato valor={res.completadas} etiqueta="Clases completadas" />
        <Dato valor={`${res.modulos} / ${res.aulas}`} etiqueta="Módulos / clases publicadas" />
        <Dato valor={res.reembolsos} etiqueta="Reembolsos" />
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <Seccion titulo="Actividad reciente" sub="Últimas clases abiertas por los alumnos">
          {res.actividad.length === 0 ? (
            <Vacio>Todavía no hay actividad. Aparece acá apenas un alumno abra una clase.</Vacio>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface text-sm">
              {res.actividad.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.clase}</p>
                    <p className="truncate text-xs text-faint">{a.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-faint">{hace(a.cuando)}</span>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Clases más vistas">
          {res.top_clases.length === 0 ? (
            <Vacio>Sin datos todavía.</Vacio>
          ) : (
            <Tabla cabeceras={["Clase", "Alumnos", "Aperturas"]}>
              {res.top_clases.map((c) => (
                <tr key={c.title}>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{c.alumnos}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{c.vistas}</td>
                </tr>
              ))}
            </Tabla>
          )}
        </Seccion>
      </div>

      <Seccion titulo="Últimas compras">
        {!ultimas || ultimas.length === 0 ? (
          <Vacio>Todavía no hay compras.</Vacio>
        ) : (
          <Tabla cabeceras={["Email", "Plan", "Fecha"]}>
            {ultimas.map((x) => (
              <tr key={x.email + x.purchased_at}>
                <td className="px-4 py-3">{x.email}</td>
                <td className="px-4 py-3 text-muted">{x.plan === "annual" ? "Anual" : "Mensual"}</td>
                <td className="px-4 py-3 text-muted">{x.refunded_at ? "Reembolsada" : fmtFecha(x.purchased_at)}</td>
              </tr>
            ))}
          </Tabla>
        )}
        <p className="mt-3 text-xs text-faint">
          “Viendo” cuenta alumnos que abrieron al menos una clase en el período. Aparecen en cuanto entran a una clase.
        </p>
      </Seccion>
    </>
  );
}
