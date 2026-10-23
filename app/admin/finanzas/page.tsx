import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";
import { COSTOS } from "@/lib/config";
import { fmtFecha, fmtUsd } from "@/lib/admin";
import { cargarFinanzas } from "@/lib/finanzas-server";
import { Dato, Seccion, Tabla, Titulo, Vacio } from "@/components/admin/ui";
import { agregarGasto, borrarGasto } from "../actions";

const RANGOS: { d: number; etiqueta: string }[] = [
  { d: 7, etiqueta: "7 días" },
  { d: 30, etiqueta: "30 días" },
  { d: 90, etiqueta: "90 días" },
  { d: 0, etiqueta: "Todo" },
];

const usd = fmtUsd;
const usdOrDash = (x: number | null) => (x === null ? "—" : usd(x));

export default function FinanzasPage(props: PageProps<"/admin/finanzas">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Contenido searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: { searchParams: Promise<{ d?: string | string[] }> }) {
  const sp = await searchParams;
  const crudo = Number(Array.isArray(sp.d) ? sp.d[0] : sp.d);
  const dias = RANGOS.some((r) => r.d === crudo) ? crudo : 30;

  const supabase = await createClient();
  const { f, gastos, faltaSql } = await cargarFinanzas(supabase, dias || null);
  const hoy = new Date().toISOString().slice(0, 10);
  const periodo = dias ? `los últimos ${dias} días` : "todo el período";
  const cuentas = f.ventas + f.extra.ventas;

  return (
    <>
      <Titulo
        titulo="Finanzas"
        sub="Lo que realmente queda: facturación después de reembolsos y de la tarifa de la Hotmart, lo que se gastó en anuncios y cuánto cuesta conseguir cada alumno. Todo en dólares."
        derecha={
          <div className="flex gap-1 rounded-full border border-line p-1 text-sm">
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
        }
      />

      {faltaSql && (
        <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 text-sm">
          <p className="font-medium text-amber-200">Falta un paso en Supabase</p>
          <p className="mt-1 text-muted">Ejecutá el archivo supabase/finanzas.sql en el SQL Editor para poder cargar gastos y guardar los montos reales de cada compra. Después recargá esta página.</p>
        </div>
      )}

      {f.estimadas > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 text-sm">
          <p className="font-medium text-amber-200">{f.estimadas === cuentas ? "Todos los números de ventas son estimados" : `${f.estimadas} de ${cuentas} ventas tienen algún número estimado`}</p>
          <p className="mt-1 text-muted">
            La Hotmart no informó el monto exacto o la tarifa de esas ventas, así que se usó el precio de lista y una tarifa de {COSTOS.tarifaHotmartPct}% + US${COSTOS.tarifaHotmartFija.toFixed(2)} por venta
            (se cambia en lib/config.ts). En las ventas nuevas se guarda el valor real que informa la Hotmart y este aviso desaparece solo.
          </p>
        </div>
      )}

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato valor={usd(f.bruto)} etiqueta="Ventas brutas" nota="Lo que pagaron los clientes, sin descontar nada" />
        <Dato valor={usd(f.neto)} etiqueta="Facturación real (neto)" nota="Sin reembolsos ni tarifa de la Hotmart" />
        <Dato valor={usd(f.gasto)} etiqueta="Gasto en anuncios" nota={periodo} />
        <Dato valor={usd(f.gananciaReal)} etiqueta="Ganancia real" nota="Neto menos anuncios" />
      </div>
      <p className="mb-12 text-xs text-faint">
        La ganancia real todavía no descuenta otros costos (herramientas, email, dominio, tiempo de edición ni impuestos).
      </p>

      <Seccion titulo="Cuánto cuesta cada alumno" sub={`Alumnos nuevos en ${periodo}, sin contar a quienes pidieron reembolso.`}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Dato valor={usdOrDash(f.cac)} etiqueta="Costo por alumno (CAC)" nota={f.alumnos ? `${usd(f.gasto)} ÷ ${f.alumnos} alumnos` : "Sin alumnos todavía"} />
          <Dato valor={usdOrDash(f.netoPorAlumno)} etiqueta="Neto por alumno" nota="Lo que deja cada venta" />
          <Dato valor={usdOrDash(f.gananciaPorAlumno)} etiqueta="Ganancia por alumno" nota="Neto menos CAC" />
          <Dato valor={f.roas === null ? "—" : `${f.roas.toLocaleString("es-PY")}x`} etiqueta="Retorno de anuncios" nota="US$ netos por cada US$1 invertido" />
          <Dato valor={usdOrDash(f.costoPorLead)} etiqueta="Costo por contacto" nota={`${f.leads} contactos nuevos`} />
        </div>
        {f.gasto > 0 && f.alumnos === 0 && <p className="mt-3 text-xs text-faint">Hay gasto pero todavía ninguna venta: el costo por alumno aparece con la primera compra.</p>}
        {f.gananciaPorAlumno !== null && f.gananciaPorAlumno < 0 && (
          <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.04] p-4 text-sm text-red-200">
            Cada alumno cuesta más de lo que deja ({usd(f.cac ?? 0)} contra {usd(f.netoPorAlumno ?? 0)}). Con este ritmo cada venta pierde {usd(Math.abs(f.gananciaPorAlumno))}.
          </p>
        )}
      </Seccion>

      <Seccion titulo="De la venta bruta a la ganancia" sub={`Cuenta completa de ${periodo}.`}>
        <Tabla cabeceras={["Concepto", "Monto"]}>
          <Fila etiqueta="Ventas brutas (planes + clase extra)" valor={usd(f.bruto)} />
          <Fila etiqueta={`Reembolsos y contracargos (${f.reembolsadas})`} valor={`− ${usd(f.reembolsos)}`} />
          <Fila etiqueta="Tarifa de la Hotmart" valor={`− ${usd(f.tarifas)}`} />
          <Fila etiqueta="Facturación real (neto)" valor={usd(f.neto)} fuerte />
          <Fila etiqueta="Gasto en anuncios" valor={`− ${usd(f.gasto)}`} />
          <Fila etiqueta="Ganancia real" valor={usd(f.gananciaReal)} fuerte />
        </Tabla>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Dato valor={usd(f.productor)} etiqueta="Parte del productor (Aaron)" nota="Lo que la Hotmart le deposita" />
          <Dato valor={usd(f.coproductor)} etiqueta="Parte del coproductor" nota={`Reparto Hotmart (${COSTOS.parteCoprodutor}% si el dato no vino en la venta)`} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-faint">
          El reparto sale del neto, antes de anuncios. Cómo se divide entre ustedes el gasto en anuncios depende de su acuerdo, por eso no se descuenta de una parte en particular.
          La clase extra aporta {usd(f.extra.neto)} netos en {f.extra.ventas} {f.extra.ventas === 1 ? "venta" : "ventas"}.
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

      <Seccion titulo="Gasto en anuncios" sub="Cargá cada vez que pagues tráfego (Meta, TikTok, Google). El monto es en dólares, tal como te lo cobran.">
        <form action={agregarGasto} className="mb-6 grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1.4fr_1fr_1.6fr_auto] sm:items-end">
          <div>
            <label htmlFor="fecha" className={ui.rotulo}>Fecha</label>
            <input id="fecha" name="fecha" type="date" required defaultValue={hoy} max={hoy} className={ui.campo} />
          </div>
          <div>
            <label htmlFor="plataforma" className={ui.rotulo}>Plataforma</label>
            <select id="plataforma" name="plataforma" className={ui.campo} defaultValue="Meta (Facebook/Instagram)">
              <option>Meta (Facebook/Instagram)</option>
              <option>TikTok</option>
              <option>Google / YouTube</option>
              <option>Otra</option>
            </select>
          </div>
          <div>
            <label htmlFor="monto" className={ui.rotulo}>Monto (US$)</label>
            <input id="monto" name="monto" type="text" inputMode="decimal" required placeholder="25.00" className={ui.campo} />
          </div>
          <div>
            <label htmlFor="nota" className={ui.rotulo}>Nota (opcional)</label>
            <input id="nota" name="nota" type="text" maxLength={200} placeholder="Campaña de captura" className={ui.campo} />
          </div>
          <button className={ui.boton}>Agregar</button>
        </form>

        {f.porPlataforma.length > 1 && (
          <p className="mb-4 text-sm text-muted">{f.porPlataforma.map((p) => `${p.plataforma}: ${usd(p.monto)}`).join(" · ")}</p>
        )}

        {gastos.length === 0 ? (
          <Vacio>Todavía no cargaste gastos en este período. Sin ellos no se puede calcular el costo por alumno.</Vacio>
        ) : (
          <Tabla cabeceras={["Fecha", "Plataforma", "Nota", "Monto", ""]}>
            {gastos.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 text-muted">{fmtFecha(g.spent_on + "T12:00:00")}</td>
                <td className="px-4 py-3">{g.platform}</td>
                <td className="px-4 py-3 text-muted">{g.note ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{usd(Number(g.amount_usd))}</td>
                <td className="px-4 py-3 text-right">
                  <form action={borrarGasto}>
                    <input type="hidden" name="id" value={g.id} />
                    <button className="text-xs text-faint transition hover:text-red-300">Borrar</button>
                  </form>
                </td>
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
