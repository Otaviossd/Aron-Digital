import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/config";
import { plantilla } from "@/lib/emails/abandono";
import { ASUNTO_COMPRA, htmlCompra } from "@/lib/emails/compra";
import { ASUNTO_LISTA, htmlLista } from "@/lib/emails/lista";
import { WHATSAPP_GRUPO_URL } from "@/lib/config";
import { PASOS } from "@/lib/sequence";
import { estadoConfig, fmtFechaHora, hace } from "@/lib/admin";
import { Pildora, Seccion, Tabla, Titulo, Vacio } from "@/components/admin/ui";

type Stats = {
  leads: number;
  captura?: number;
  pendientes: number;
  bajas: number;
  enviados: Record<string, number>;
  recuperados: number;
};

type Envio = { cuando: string; para: string; tipo: string; estado: "enviado" | "falló" };

export default function EmailPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Email />
    </Suspense>
  );
}

async function Email() {
  const supabase = await createClient();
  const [{ data: es }, { data: sends }, { data: log }, { data: leads }, { count: compras }, { count: bienvenidas }] = await Promise.all([
    supabase.rpc("email_stats"),
    supabase.from("email_sends").select("step, sent_at, leads(email)").order("sent_at", { ascending: false }).limit(40),
    supabase.from("email_log").select("to_email, kind, status, created_at").order("created_at", { ascending: false }).limit(40),
    supabase.from("leads").select("email, created_at, source, checkout_at, converted_at, unsubscribed_at").order("created_at", { ascending: false }).limit(15),
    supabase.from("email_log").select("id", { count: "exact", head: true }).eq("kind", "compra").eq("status", "sent"),
    supabase.from("email_log").select("id", { count: "exact", head: true }).eq("kind", "lista").eq("status", "sent"),
  ]);

  const stats = (es ?? { leads: 0, pendientes: 0, bajas: 0, enviados: {}, recuperados: 0 }) as Stats;
  const config = estadoConfig();
  const emailListo = config.email.filter((c) => !("opcional" in c && c.opcional)).every((c) => c.ok);
  const resendOk = config.email.find((c) => c.id === "resend")?.ok && config.email.find((c) => c.id === "from")?.ok;
  const cronOk = config.email.find((c) => c.id === "cron")?.ok;

  // Historial unificado: compras (email_log) + carrito abandonado (email_sends)
  const historial: Envio[] = [
    ...(log ?? []).map((l) => ({
      cuando: l.created_at as string,
      para: l.to_email as string,
      tipo: l.kind === "compra" ? "Confirmación de compra" : l.kind === "lista" ? "Bienvenida a la lista" : String(l.kind),
      estado: (l.status === "sent" ? "enviado" : "falló") as Envio["estado"],
    })),
    ...(sends ?? []).map((s) => {
      const lead = Array.isArray(s.leads) ? s.leads[0] : s.leads;
      return {
        cuando: s.sent_at as string,
        para: (lead?.email as string | undefined) ?? "—",
        tipo: `Carrito abandonado · email ${s.step}`,
        estado: "enviado" as const,
      };
    }),
  ]
    .sort((a, b) => new Date(b.cuando).getTime() - new Date(a.cuando).getTime())
    .slice(0, 40);

  const ctx = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tu-sitio.com",
    email: "alumno@ejemplo.com",
    bajaUrl: "#",
    marca: BRAND,
    ofertaFin: process.env.OFERTA_FIN || undefined,
  };
  const pasoTexto = (h: number) => (h < 24 ? `${h} h` : `${h} h (${h / 24} ${h / 24 === 1 ? "día" : "días"})`);

  return (
    <>
      <Titulo
        titulo="Email marketing"
        derecha={
          <Link href="/admin/email/mapa" className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20">
            Ver mapa de emails
          </Link>
        }
        sub="Los emails que el sistema envía solo, cuántos salieron y qué dicen. Las automatizaciones nuevas se suman a esta misma pantalla."
      />

      {/* Estado del envío */}
      <Seccion titulo="Estado del envío">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Pildora tono={emailListo ? "ok" : "aviso"}>{emailListo ? "Listo para enviar" : "Falta configurar"}</Pildora>
            <span className="text-sm text-muted">
              {emailListo
                ? "Resend y el agendador están configurados."
                : "Completá lo que falta en Vercel > Settings > Environment Variables y hacé un Redeploy."}
            </span>
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {config.email.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${c.ok ? "bg-emerald-400" : "opcional" in c && c.opcional ? "bg-white/20" : "bg-amber-400"}`} />
                <span className={c.ok ? "text-muted" : "text-ink"}>{c.etiqueta}</span>
              </li>
            ))}
          </ul>
        </div>
      </Seccion>

      {/* Automatizaciones */}
      <Seccion titulo="Automatizaciones" sub="Cada una se enciende sola cuando su configuración está lista.">
        <div className="grid gap-3 lg:grid-cols-2">
          <Tarjeta
            titulo="Confirmación de compra"
            estado={resendOk ? <Pildora tono="ok">Activa</Pildora> : <Pildora tono="aviso">Falta Resend</Pildora>}
            texto="Apenas PayPal confirma el pago, el alumno recibe un email con un botón para entrar con un clic."
            datos={[["Enviados", String(compras ?? 0)]]}
          />
          <Tarjeta
            titulo="Lista de espera"
            estado={resendOk ? <Pildora tono="ok">Activa</Pildora> : <Pildora tono="aviso">Falta Resend</Pildora>}
            texto="Quien deja su email en /captura recibe una bienvenida con el botón del grupo de WhatsApp. No recibe emails de carrito abandonado."
            datos={[
              ["En la lista", String(stats.captura ?? 0)],
              ["Bienvenidas enviadas", String(bienvenidas ?? 0)],
            ]}
          />
          <Tarjeta
            titulo="Carrito abandonado"
            estado={resendOk && cronOk ? <Pildora tono="ok">Activa</Pildora> : <Pildora tono="aviso">{!resendOk ? "Falta Resend" : "Falta el agendador"}</Pildora>}
            texto={`${PASOS.length} emails a quienes escribieron su email en el checkout y no compraron: ${PASOS.map((p) => pasoTexto(p.afterHours)).join(", ")} después.`}
            datos={[
              ["Emails guardados", String(stats.leads)],
              ["Pendientes", String(stats.pendientes)],
              ["Recuperados", String(stats.recuperados)],
              ["Bajas", String(stats.bajas)],
            ]}
          />
          <Tarjeta
            titulo="Referidos"
            estado={<Pildora>Próximamente</Pildora>}
            texto="Una promoción para que quien ya compró invite a otras personas."
          />
          <Tarjeta
            titulo="Campañas manuales"
            estado={<Pildora>Próximamente</Pildora>}
            texto="Enviar un aviso a todos los alumnos o a los leads (por ejemplo, una clase nueva o la Black Friday)."
          />
        </div>
        <p className="mt-3 text-xs text-faint">
          Enviados del carrito abandonado: email 1 = {stats.enviados["1"] ?? 0} · email 2 = {stats.enviados["2"] ?? 0} · email 3 ={" "}
          {stats.enviados["3"] ?? 0}. “Recuperado” = compró después de recibir al menos un email; puede incluir a quien habría comprado igual.
        </p>
      </Seccion>

      {/* Historial */}
      <Seccion titulo="Historial de envíos" sub="Los últimos 40 emails enviados por el sistema.">
        {historial.length === 0 ? (
          <Vacio>Todavía no se envió ningún email. Aparecen acá en cuanto salga el primero.</Vacio>
        ) : (
          <Tabla cabeceras={["Cuándo", "Para", "Email", "Estado"]}>
            {historial.map((h, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap px-4 py-3 text-muted" title={fmtFechaHora(h.cuando)}>
                  {hace(h.cuando)}
                </td>
                <td className="px-4 py-3">{h.para}</td>
                <td className="px-4 py-3 text-muted">{h.tipo}</td>
                <td className="px-4 py-3">
                  <Pildora tono={h.estado === "enviado" ? "ok" : "error"}>{h.estado === "enviado" ? "Enviado" : "Falló"}</Pildora>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

      {/* Leads */}
      <Seccion titulo="Últimos contactos" sub="Personas que dejaron su email en la página de captura o en el checkout.">
        {!leads || leads.length === 0 ? (
          <Vacio>Todavía no hay leads. Se guardan cuando alguien termina de escribir su email en el checkout.</Vacio>
        ) : (
          <Tabla cabeceras={["Email", "Llegó", "Origen", "Estado"]}>
            {leads.map((l) => (
              <tr key={l.email}>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3 text-muted">{hace(l.created_at)}</td>
                <td className="px-4 py-3 text-muted">{l.source === "captura" ? "Captura" : "Checkout"}</td>
                <td className="px-4 py-3">
                  {l.unsubscribed_at ? (
                    <Pildora tono="neutro">Se dio de baja</Pildora>
                  ) : l.converted_at ? (
                    <Pildora tono="ok">Compró</Pildora>
                  ) : l.checkout_at ? (
                    <Pildora tono="aviso">Carrito abandonado</Pildora>
                  ) : (
                    <Pildora tono="neutro">En la lista</Pildora>
                  )}
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Seccion>

      {/* Vista previa */}
      <Seccion titulo="Cómo se ven los emails" sub="Vista previa con datos de ejemplo. Los textos se editan en lib/emails.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Previa titulo="Bienvenida a la lista" asunto={ASUNTO_LISTA} html={htmlLista({ whatsappUrl: WHATSAPP_GRUPO_URL, bajaUrl: "#", marca: BRAND })} />
          <Previa titulo="Confirmación de compra" asunto={ASUNTO_COMPRA} html={htmlCompra({ accessLink: "#", loginLink: `${ctx.siteUrl}/entrar`, to: ctx.email, plan: "lifetime" })} />
          {PASOS.map((p) => {
            const t = plantilla(p.step, ctx);
            return <Previa key={p.step} titulo={`Carrito abandonado · email ${p.step} (${pasoTexto(p.afterHours)})`} asunto={t.asunto} html={t.html} />;
          })}
        </div>
      </Seccion>
    </>
  );
}

function Tarjeta({ titulo, estado, texto, datos }: { titulo: string; estado: React.ReactNode; texto: string; datos?: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-medium tracking-tight">{titulo}</h3>
        {estado}
      </div>
      <p className="text-sm leading-relaxed text-muted">{texto}</p>
      {datos && (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          {datos.map(([k, v]) => (
            <div key={k}>
              <dd className="text-xl font-semibold tabular-nums">{v}</dd>
              <dt className="text-xs text-faint">{k}</dt>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Previa({ titulo, asunto, html }: { titulo: string; asunto: string; html: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-3">
        <p className="text-sm font-medium">{titulo}</p>
        <p className="text-xs text-faint">Asunto: {asunto}</p>
      </div>
      <iframe title={titulo} srcDoc={`<body style="margin:0;background:#fff">${html}</body>`} sandbox="" className="h-80 w-full bg-white" />
    </div>
  );
}
