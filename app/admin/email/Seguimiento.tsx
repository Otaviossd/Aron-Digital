import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { fichasCaptura } from "@/lib/emails/captura";
import { PASOS_CAPTURA } from "@/lib/sequence-captura";
import { PASOS_EXTRA } from "@/lib/sequence-extra";
import { PASOS } from "@/lib/sequence";
import { cargarExcluidos, enLista } from "@/lib/excluidos";
import { fmtFechaHora, hace } from "@/lib/admin";
import { Dato, Pildora, Seccion, Tabla, Vacio } from "@/components/admin/ui";

const LIMITE_DIARIO_GRATIS = 100;
const ahoraMs = () => Date.now();
const haceDias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

// Medianoche de hoy en Paraguay (UTC-3), como ISO.
function inicioDeHoy() {
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Asuncion" }).format(new Date());
  return new Date(`${dia}T00:00:00-03:00`);
}
const diaPY = (d: string | Date) =>
  new Intl.DateTimeFormat("es-PY", { timeZone: "America/Asuncion", day: "2-digit", month: "2-digit" }).format(new Date(d));

type Entrega = Record<string, number> & { total: number };

async function entregaResend(): Promise<Entrega | null> {
  if (!process.env.RESEND_API_KEY) return null;
  try {
    const { data } = await new Resend(process.env.RESEND_API_KEY).emails.list({ limit: 100 });
    if (!data) return null;
    const r: Entrega = { total: data.data.length };
    for (const e of data.data) r[e.last_event] = (r[e.last_event] ?? 0) + 1;
    return r;
  } catch {
    return null;
  }
}

export async function Seguimiento() {
  const supabase = await createClient();
  const excl = await cargarExcluidos(supabase);
  const L = enLista(excl);
  const hoy = inicioDeHoy().toISOString();
  const hace7 = haceDias(7);
  const cont = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0, () => 0);

  const [leads, captura, compraron, bajas, logOk, logFail, logHoy, sendsHoy, extraHoy, leads7, fallos, entrega] = await Promise.all([
    cont(supabase.from("leads").select("id", { count: "exact", head: true }).not("email", "in", L)),
    cont(supabase.from("leads").select("id", { count: "exact", head: true }).not("email", "in", L).eq("source", "captura")),
    cont(supabase.from("leads").select("id", { count: "exact", head: true }).not("email", "in", L).not("converted_at", "is", null)),
    cont(supabase.from("leads").select("id", { count: "exact", head: true }).not("email", "in", L).not("unsubscribed_at", "is", null)),
    cont(supabase.from("email_log").select("id", { count: "exact", head: true }).not("to_email", "in", L).eq("status", "sent")),
    cont(supabase.from("email_log").select("id", { count: "exact", head: true }).not("to_email", "in", L).eq("status", "failed")),
    cont(supabase.from("email_log").select("id", { count: "exact", head: true }).not("to_email", "in", L).eq("status", "sent").gte("created_at", hoy)),
    cont(supabase.from("email_sends").select("id, leads!inner(email)", { count: "exact", head: true }).not("leads.email", "in", L).gte("sent_at", hoy)),
    cont(supabase.from("extra_sends").select("id", { count: "exact", head: true }).not("email", "in", L).gte("sent_at", hoy)),
    supabase.from("leads").select("created_at").not("email", "in", L).eq("source", "captura").gte("created_at", hace7).order("created_at").limit(1000),
    supabase.from("email_log").select("to_email, kind, error, created_at").not("to_email", "in", L).eq("status", "failed").order("created_at", { ascending: false }).limit(8),
    entregaResend(),
  ]);

  // Enviados por paso: una consulta de conteo por paso (el límite de 1000 filas de la API no estorba).
  const [porCaptura, porAbandono, porExtra] = await Promise.all([
    Promise.all(
      PASOS_CAPTURA.map((p) =>
        cont(supabase.from("email_sends").select("id, leads!inner(email)", { count: "exact", head: true }).not("leads.email", "in", L).eq("sequence", "captura").eq("step", p.step)),
      ),
    ),
    Promise.all(
      PASOS.map((p) =>
        cont(supabase.from("email_sends").select("id, leads!inner(email)", { count: "exact", head: true }).not("leads.email", "in", L).eq("sequence", "abandono").eq("step", p.step)),
      ),
    ),
    Promise.all(PASOS_EXTRA.map((p) => cont(supabase.from("extra_sends").select("id", { count: "exact", head: true }).not("email", "in", L).eq("step", p.step)))),
  ]);

  const enviosCaptura = porCaptura.reduce((a, b) => a + b, 0);
  const enviosAbandono = porAbandono.reduce((a, b) => a + b, 0);
  const enviosExtra = porExtra.reduce((a, b) => a + b, 0);
  const totalEnviados = logOk + enviosCaptura + enviosAbandono + enviosExtra;
  const enviadosHoy = logHoy + sendsHoy + extraHoy;
  const tasaCompra = captura > 0 ? Math.round((compraron / Math.max(leads, 1)) * 1000) / 10 : 0;

  // Leads de captura por día (últimos 7)
  const porDia = new Map<string, number>();
  for (const l of leads7.data ?? []) {
    const d = diaPY(l.created_at as string);
    porDia.set(d, (porDia.get(d) ?? 0) + 1);
  }

  const fichas = fichasCaptura();
  const ahora = ahoraMs();
  const llegaron = entrega ? (entrega.delivered ?? 0) + (entrega.opened ?? 0) + (entrega.clicked ?? 0) : 0;
  const malos = entrega ? (entrega.bounced ?? 0) + (entrega.complained ?? 0) + (entrega.failed ?? 0) + (entrega.suppressed ?? 0) : 0;

  return (
    <>
      <Seccion titulo="Seguimiento en vivo" sub="Contactos, emails enviados y si están llegando. Se actualiza cada vez que abrís esta pantalla.">
        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Dato valor={leads} etiqueta="Contactos en total" nota={`${captura} de la captura · ${bajas} bajas`} />
          <Dato valor={totalEnviados} etiqueta="Emails enviados" nota={`${logOk} de compra y lista · ${enviosCaptura} captura y lanzamiento`} />
          <Dato
            valor={enviadosHoy}
            etiqueta="Enviados hoy"
            nota={enviadosHoy >= LIMITE_DIARIO_GRATIS ? "Pasaste los 100 diarios del plan gratis de Resend" : `Límite del plan gratis: ${LIMITE_DIARIO_GRATIS} por día`}
          />
          <Dato valor={logFail} etiqueta="Envíos que fallaron" nota={logFail === 0 ? "Ninguno" : "Detalle abajo"} />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Dato valor={compraron} etiqueta="Contactos que compraron" nota={`${tasaCompra}% de los contactos`} />
          <Dato valor={enviosAbandono} etiqueta="Carrito abandonado" nota="emails enviados" />
          <Dato valor={enviosExtra} etiqueta="Clase extra" nota="emails enviados" />
          <Dato
            valor={entrega ? `${llegaron}/${entrega.total}` : "—"}
            etiqueta="Llegaron a la bandeja"
            nota={entrega ? `Últimos ${entrega.total} según Resend · ${malos} rebotados` : "No pudimos consultar a Resend"}
          />
        </div>
        {entrega && (
          <p className="mt-3 text-xs text-faint">
            Resend (últimos {entrega.total} emails): entregados {entrega.delivered ?? 0} · abiertos {entrega.opened ?? 0} · clics {entrega.clicked ?? 0} · rebotados{" "}
            {entrega.bounced ?? 0} · marcados como spam {entrega.complained ?? 0}. Las aperturas y clics solo aparecen si activás “Open and click tracking” en Resend &gt; Domains.
          </p>
        )}
      </Seccion>

      <Seccion titulo="Contactos nuevos por día" sub="Quién entró a la lista de espera en los últimos 7 días.">
        {porDia.size === 0 ? (
          <Vacio>Todavía no entró nadie en estos 7 días.</Vacio>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...porDia.entries()].map(([d, n]) => (
              <div key={d} className="rounded-xl border border-line bg-surface px-4 py-3 text-center">
                <p className="text-xl font-semibold tabular-nums">{n}</p>
                <p className="text-xs text-faint">{d}</p>
              </div>
            ))}
          </div>
        )}
      </Seccion>

      <Seccion titulo="Captura y lanzamiento, email por email" sub="Cuántos salieron de cada uno. Salen solos a la hora indicada (hora de Paraguay).">
        <Tabla cabeceras={["Email", "Asunto", "Sale", "Enviados", "Estado"]}>
          {PASOS_CAPTURA.map((p, i) => {
            const f = fichas.find((x) => x.step === p.step);
            const n = porCaptura[i];
            const ya = ahora >= new Date(p.sendAt).getTime();
            return (
              <tr key={p.step}>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{p.id}</td>
                <td className="px-4 py-3 text-muted">{f?.asunto ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtFechaHora(p.sendAt)}</td>
                <td className="px-4 py-3 tabular-nums">{n}</td>
                <td className="px-4 py-3">
                  {n > 0 ? <Pildora tono="ok">Enviado</Pildora> : ya ? <Pildora tono="aviso">Debería haber salido</Pildora> : <Pildora tono="neutro">Programado</Pildora>}
                </td>
              </tr>
            );
          })}
        </Tabla>
        <p className="mt-2 text-xs text-faint">
          “Debería haber salido” aparece si pasó la hora y todavía no se envió nada: puede ser que no haya contactos, que el envío esté en pausa (CAPTURA_EMAILS_PAUSADAS) o que el agendador de GitHub no haya corrido.
        </p>
      </Seccion>

      <Seccion titulo="Clase extra" sub="Emails a quienes compraron el curso y no la clase extra. Se activan el 11/11 con EXTRA_EMAILS_ACTIVAS=1.">
        <Tabla cabeceras={["Paso", "Ventana", "Enviados"]}>
          {PASOS_EXTRA.map((p, i) => (
            <tr key={p.step}>
              <td className="px-4 py-3 font-medium">Email {p.step}</td>
              <td className="px-4 py-3 text-muted">
                de {Math.round((p.desde / 24) * 10) / 10} a {Math.round((p.hasta / 24) * 10) / 10} días después de la compra
              </td>
              <td className="px-4 py-3 tabular-nums">{porExtra[i]}</td>
            </tr>
          ))}
        </Tabla>
      </Seccion>

      <Seccion titulo="Envíos que fallaron" sub="Si algo no llega, el motivo queda acá.">
        {!fallos.data || fallos.data.length === 0 ? (
          <Vacio>Ningún envío falló.</Vacio>
        ) : (
          <Tabla cabeceras={["Cuándo", "Para", "Tipo", "Motivo"]}>
            {fallos.data.map((f, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{hace(f.created_at as string)}</td>
                <td className="px-4 py-3">{f.to_email as string}</td>
                <td className="px-4 py-3 text-muted">{f.kind as string}</td>
                <td className="px-4 py-3 text-xs text-amber-200">{(f.error as string | null) ?? "—"}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>
    </>
  );
}
