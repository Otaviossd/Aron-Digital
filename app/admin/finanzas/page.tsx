import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { COSTOS } from "@/lib/config";
import { fmtUsd } from "@/lib/admin";
import { cargarFinanzas } from "@/lib/finanzas-server";
import { Dato, Seccion, Tabla, Titulo, Vacio } from "@/components/admin/ui";

const RANGOS: { d: number; etiqueta: string }[] = [
  { d: 7, etiqueta: "7 días" },
  { d: 30, etiqueta: "30 días" },
  { d: 90, etiqueta: "90 días" },
  { d: 0, etiqueta: "Todo" },
];

const usd = fmtUsd;

export default function FinanzasPage(props: PageProps<"/admin/finanzas">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Contenido searchParams={props.searchParams} />
    </Suspense>
  );
}

type Params = { d?: string | string[]; desde?: string | string[]; hasta?: string | string[] };
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

async function Contenido({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const desdeP = uno(sp.desde);
  const hastaP = uno(sp.hasta);
  const personalizado = Boolean(desdeP && hastaP && FECHA.test(desdeP) && FECHA.test(hastaP) && desdeP <= hastaP);
  const crudo = Number(uno(sp.d));
  const dias = personalizado ? -1 : RANGOS.some((r) => r.d === crudo) ? crudo : 30;

  const supabase = await createClient();
  const { f } = await cargarFinanzas(supabase, personalizado ? { desde: desdeP!, hasta: hastaP! } : dias || null);
  const periodo = personalizado ? `del ${desdeP} al ${hastaP}` : dias ? `los últimos ${dias} días` : "todo el período";
  const cuentas = f.ventas + f.extra.ventas;
  const hoy = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Asuncion" });

  return (
    <>
      <Titulo
        titulo="Finanzas"
        sub="Lo que realmente entra: ventas de la Hotmart después de reembolsos y de la tarifa. Todo en dólares. No incluye gastos de anuncios."
        derecha={
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap gap-1 rounded-full border border-line p-1 text-sm">
              {RANGOS.map((r) => (
                <Link
                  key={r.d}
                  href={`/admin/finanzas?d=${r.d}`}
                  className={`rounded-full px-3.5 py-1.5 transition ${r.d === dias ? "bg-white/10 font-medium text-ink" : "text-muted hover:text-ink"}`}
                >
                  {r.etiqueta}
                </Link>
              ))}
            </div>
            <form method="get" className="flex flex-wrap items-end gap-2 text-xs text-muted">
              <label className="flex flex-col gap-1">
                Desde
                <input type="date" name="desde" required defaultValue={personalizado ? desdeP : undefined} max={hoy} className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-ink outline-none focus:border-white/35" />
              </label>
              <label className="flex flex-col gap-1">
                Hasta
                <input type="date" name="hasta" required defaultValue={personalizado ? hastaP : undefined} max={hoy} className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-ink outline-none focus:border-white/35" />
              </label>
              <button className={`rounded-full px-4 py-2 text-sm font-medium transition ${personalizado ? "bg-white/10 text-ink" : "border border-line text-muted hover:text-ink"}`}>Aplicar fechas</button>
            </form>
          </div>
        }
      />

      {f.estimadas > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 text-sm">
          <p className="font-medium text-amber-200">{f.estimadas === cuentas ? "Todos los números de ventas son estimados" : `${f.estimadas} de ${cuentas} ventas tienen algún número estimado`}</p>
          <p className="mt-1 text-muted">
            La Hotmart no informó el monto exacto o la tarifa de esas ventas, así que se usó el precio de lista y una tarifa de {COSTOS.tarifaHotmartPct}% + US${COSTOS.tarifaHotmartFija.toFixed(2)} por venta
            (se cambia en lib/config.ts). En las ventas nuevas se guarda el valor real que informa la Hotmart y este aviso desaparece solo.
          </p>
        </div>
      )}

      <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato valor={usd(f.bruto)} etiqueta="Ventas brutas" nota="Lo que pagaron los clientes, sin descontar nada" />
        <Dato valor={usd(f.neto)} etiqueta="Facturación real (neto)" nota="Sin reembolsos ni tarifa de la Hotmart" />
        <Dato valor={f.alumnos} etiqueta="Alumnos nuevos" nota={`${f.reembolsadas} ${f.reembolsadas === 1 ? "reembolso" : "reembolsos"} aparte`} />
        <Dato valor={f.netoPorAlumno === null ? "—" : usd(f.netoPorAlumno)} etiqueta="Neto por alumno" nota="Lo que deja cada venta" />
      </div>

      <Seccion titulo="De la venta bruta al neto" sub={`Cuenta completa de ${periodo}.`}>
        <Tabla cabeceras={["Concepto", "Monto"]}>
          <Fila etiqueta="Ventas brutas (planes + clase extra)" valor={usd(f.bruto)} />
          <Fila etiqueta={`Reembolsos y contracargos (${f.reembolsadas})`} valor={`− ${usd(f.reembolsos)}`} />
          <Fila etiqueta="Tarifa de la Hotmart" valor={`− ${usd(f.tarifas)}`} />
          <Fila etiqueta="Facturación real (neto)" valor={usd(f.neto)} fuerte />
        </Tabla>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Dato valor={usd(f.productor)} etiqueta="Parte del productor (Aaron)" nota="Lo que la Hotmart le deposita" />
          <Dato valor={usd(f.coproductor)} etiqueta="Parte del coproductor" nota={`Reparto Hotmart (${COSTOS.parteCoprodutor}% si el dato no vino en la venta)`} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-faint">
          La facturación real no descuenta otros costos (anuncios, herramientas, impuestos). La clase extra aporta {usd(f.extra.neto)} netos en {f.extra.ventas} {f.extra.ventas === 1 ? "venta" : "ventas"}.
        </p>
      </Seccion>

      <Seccion titulo="Por tipo de venta">
        {f.porPlan.length === 0 ? (
          <Vacio>Todavía no hay ventas en este período.</Vacio>
        ) : (
          <Tabla cabeceras={["Oferta", "Ventas", "Reembolsos", "Bruto", "Neto"]}>
            {f.porPlan.map((p) => (
              <tr key={p.clave}>
                <td className="px-4 py-3 font-medium">{p.etiqueta}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{p.ventas}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{p.reembolsadas}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{usd(p.bruto)}</td>
                <td className="px-4 py-3 tabular-nums">{usd(p.neto)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

    </>
  );
}

function Fila({ etiqueta, valor, fuerte }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <tr className={fuerte ? "bg-white/[0.03]" : ""}>
      <td className={`px-4 py-3 ${fuerte ? "font-semibold" : "text-muted"}`}>{etiqueta}</td>
      <td className={`px-4 py-3 text-right tabular-nums ${fuerte ? "font-semibold" : ""}`}>{valor}</td>
    </tr>
  );
}
