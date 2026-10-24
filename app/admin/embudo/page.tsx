import { Suspense } from "react";
import Link from "next/link";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { Seccion, Tabla, Titulo, Vacio } from "@/components/admin/ui";

type Embudo = {
  paginas: { path: string; visitantes: number; registros: number; checkout: number }[];
  origenes: { origen: string; visitantes: number; registros: number; checkout: number }[];
  registros_lista: number;
  compras: number;
};

const RANGOS = [7, 30, 90];

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : "—");

export default function EmbudoPage(props: PageProps<"/admin/embudo">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Contenido searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: { searchParams: Promise<{ d?: string | string[] }> }) {
  const sp = await searchParams;
  const crudo = Number(Array.isArray(sp.d) ? sp.d[0] : sp.d);
  const dias = RANGOS.includes(crudo) ? crudo : 30;

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_embudo", { p_days: dias });
  const e = (data ?? null) as Embudo | null;
  if (!e) return <Vacio>No pudimos leer el embudo. Ejecutá de nuevo supabase/schema.sql en el SQL Editor y recargá.</Vacio>;

  const cap = e.paginas.find((p) => p.path === "/captura") ?? { visitantes: 0, registros: 0, checkout: 0 };
  const ven = e.paginas.find((p) => p.path === "/ventas") ?? { visitantes: 0, registros: 0, checkout: 0 };
  const sitio = siteUrl();

  return (
    <>
      <Titulo
        titulo="Embudo"
        sub="Cuánta gente llega a cada página, cuántos dejan su email, cuántos llegan al checkout y cuántos compran."
        derecha={
          <div className="flex gap-1 rounded-full border border-line p-1 text-sm">
            {RANGOS.map((r) => (
              <Link
                key={r}
                href={`/admin/embudo?d=${r}`}
                className={`rounded-full px-3.5 py-1.5 transition ${r === dias ? "bg-white/10 font-medium text-ink" : "text-muted hover:text-ink"}`}
              >
                {r} días
              </Link>
            ))}
          </div>
        }
      />

      <div className="mb-12 grid gap-4 lg:grid-cols-2">
        <Paso
          titulo="Página de captura"
          ruta="/captura"
          filas={[
            { etiqueta: "Visitantes", valor: cap.visitantes, base: cap.visitantes },
            { etiqueta: "Dejaron su email", valor: cap.registros, base: cap.visitantes, tasa: pct(cap.registros, cap.visitantes) },
          ]}
          pie={`${e.registros_lista} personas se sumaron a la lista en este período.`}
        />
        <Paso
          titulo="Página de ventas"
          ruta="/ventas"
          filas={[
            { etiqueta: "Visitantes", valor: ven.visitantes, base: ven.visitantes },
            { etiqueta: "Llegaron al checkout", valor: ven.checkout, base: ven.visitantes, tasa: pct(ven.checkout, ven.visitantes) },
            { etiqueta: "Compras (total del período)", valor: e.compras, base: ven.visitantes, tasa: pct(e.compras, ven.checkout) },
          ]}
          pie="La tasa de compras se calcula sobre quienes llegaron al checkout. Las compras incluyen todas las ventas del período, vengan de donde vengan."
        />
      </div>

      <Seccion titulo="De dónde llegan" sub="Instagram, anuncios, enlaces directos. Usá los enlaces de abajo para que cada origen quede identificado.">
        {e.origenes.length === 0 ? (
          <Vacio>Todavía no hay visitas registradas en este período.</Vacio>
        ) : (
          <Tabla cabeceras={["Origen", "Visitantes", "Dejaron email", "Llegaron al checkout"]}>
            {e.origenes.map((o) => (
              <tr key={o.origen}>
                <td className="px-4 py-3 font-medium">{o.origen}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{o.visitantes}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{o.registros}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{o.checkout}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

      <Seccion titulo="Enlaces para compartir" sub="Cada uno marca el origen con utm_source. Cambiá la palabra después del = si querés otro nombre.">
        <ul className="space-y-2 text-sm">
          {[
            ["Bio de Instagram", `${sitio}/captura?utm_source=instagram-bio`],
            ["Stories", `${sitio}/captura?utm_source=instagram-stories`],
            ["Anuncios", `${sitio}/captura?utm_source=anuncios`],
            ["Grupo de WhatsApp", `${sitio}/ventas?utm_source=whatsapp`],
            ["Email a la lista", `${sitio}/ventas?utm_source=email`],
          ].map(([t, u]) => (
            <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3">
              <span className="text-muted">{t}</span>
              <code className="break-all text-xs text-ink">{u}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Para que tus propias visitas no cuenten, abrí una vez <code className="text-muted">{sitio}/captura?rastreo=off</code> en cada
          navegador del equipo. Para volver a contar: <code className="text-muted">?rastreo=on</code>.
        </p>
      </Seccion>
    </>
  );
}

function Paso({
  titulo,
  ruta,
  filas,
  pie,
}: {
  titulo: string;
  ruta: string;
  filas: { etiqueta: string; valor: number; base: number; tasa?: string }[];
  pie: string;
}) {
  const max = Math.max(1, ...filas.map((f) => f.valor), filas[0]?.base ?? 1);
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold tracking-tight">{titulo}</h2>
        <code className="text-xs text-faint">{ruta}</code>
      </div>
      <div className="space-y-5">
        {filas.map((f) => (
          <div key={f.etiqueta}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted">{f.etiqueta}</span>
              <span>
                <span className="text-xl font-semibold tabular-nums">{f.valor}</span>
                {f.tasa && <span className="ml-2 text-xs text-accent">{f.tasa}</span>}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round((f.valor / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-faint">{pie}</p>
    </div>
  );
}
