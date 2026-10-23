import { Titulo } from "@/components/admin/ui";
import CopiarEnlace from "@/components/admin/CopiarEnlace";
import { CHECKOUT_URLS, EXTRA, PAGINAS, PRECOS } from "@/lib/config";

export const metadata = { title: "Enlaces" };

const ORIGENES = [
  { nombre: "Instagram (bio)", utm: "instagram" },
  { nombre: "Instagram (stories)", utm: "stories" },
  { nombre: "WhatsApp", utm: "whatsapp" },
  { nombre: "TikTok", utm: "tiktok" },
  { nombre: "Email", utm: "email" },
];

const CHECKOUTS = [
  { nombre: `Checkout: 1 año (US$${PRECOS.anual.valor})`, url: CHECKOUT_URLS.anual, variable: "NEXT_PUBLIC_HOTMART_URL_ANUAL" },
  { nombre: `Checkout: vitalicio (US$${PRECOS.vitalicio.valor})`, url: CHECKOUT_URLS.vitalicio, variable: "NEXT_PUBLIC_HOTMART_URL_VITALICIO" },
  { nombre: `Checkout: promo de lanzamiento (US$${PRECOS.promo.valor})`, url: CHECKOUT_URLS.promo, variable: "NEXT_PUBLIC_HOTMART_URL_PROMO" },
  { nombre: `Checkout: clase extra (US$${EXTRA.valor})`, url: EXTRA.checkoutUrl, variable: "NEXT_PUBLIC_HOTMART_URL_EXTRA" },
];

const sitio = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://www.lanuevaolaacademy.com").replace(/\/$/, "");

export default function EnlacesPage() {
  const base = sitio();

  return (
    <>
      <Titulo
        titulo="Enlaces"
        sub="Las páginas públicas del sitio, listas para copiar y compartir. Los enlaces con origen sirven para ver en el Embudo de dónde llega cada visita."
      />

      <div className="space-y-4">
        {PAGINAS.map((p) => {
          const url = `${base}${p.ruta}`;
          return (
            <section key={p.ruta} className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium tracking-tight">{p.nombre}</h2>
                  <p className="mt-0.5 text-sm text-faint">{p.detalle}</p>
                </div>
                {!p.lista && <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-muted">Próximamente</span>}
              </div>

              {p.lista ? (
                <>
                  <div className="flex flex-col gap-3 rounded-xl border border-line bg-bg px-4 py-3 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 break-all text-sm text-ink">{url}</code>
                    <div className="flex shrink-0 items-center gap-4">
                      <CopiarEnlace url={url} />
                      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-accent underline-offset-4 hover:underline">
                        Abrir
                      </a>
                    </div>
                  </div>

                  {(p.ruta === "/captura" || p.ruta === "/ventas") && (
                  <>
                  <p className="mb-2 mt-5 text-xs font-medium text-muted">Con origen de la visita</p>
                  <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {ORIGENES.map((o) => {
                      const u = `${url}?utm_source=${o.utm}`;
                      return (
                        <li key={o.utm} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 bg-bg px-4 py-3 md:grid-cols-[10rem_1fr_auto] md:gap-y-0 md:py-2.5">
                          <span className="text-sm text-muted">{o.nombre}</span>
                          <span className="row-span-2 col-start-2 row-start-1 md:row-span-1 md:col-start-3">
                            <CopiarEnlace url={u} />
                          </span>
                          <code className="col-span-1 min-w-0 break-all text-xs text-faint md:col-start-2 md:row-start-1">{u}</code>
                        </li>
                      );
                    })}
                  </ul>
                  </>
                  )}
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-faint">
                  Todavía no está lista. Cuando la publiquemos, el enlace aparece acá para copiar.
                </p>
              )}
            </section>
          );
        })}

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-medium tracking-tight">Páginas de pago (Hotmart)</h2>
          <p className="mb-4 mt-0.5 text-sm text-faint">Son los checkouts de la Hotmart. Los usa el botón de la página de ventas; no se comparten sueltos (la gente primero deja sus datos).</p>
          <ul className="space-y-3">
            {CHECKOUTS.map((c) => (
              <li key={c.variable} className="rounded-xl border border-line bg-bg px-4 py-3">
                <p className="mb-1 text-sm text-muted">{c.nombre}</p>
                {c.url ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 break-all text-xs text-ink">{c.url}</code>
                    <div className="flex shrink-0 items-center gap-4">
                      <CopiarEnlace url={c.url} />
                      <a href={c.url} target="_blank" rel="noreferrer" className="text-sm text-accent underline-offset-4 hover:underline">
                        Abrir
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-faint">Falta configurar <code>{c.variable}</code> en la Vercel.</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
