import { Titulo } from "@/components/admin/ui";
import CopiarEnlace from "@/components/admin/CopiarEnlace";
import { PAGINAS } from "@/lib/config";

export const metadata = { title: "Enlaces" };

const ORIGENES = [
  { nombre: "Instagram (bio)", utm: "instagram" },
  { nombre: "Instagram (stories)", utm: "stories" },
  { nombre: "WhatsApp", utm: "whatsapp" },
  { nombre: "TikTok", utm: "tiktok" },
  { nombre: "Email", utm: "email" },
];

const sitio = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://aron-digital.vercel.app").replace(/\/$/, "");

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
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg px-4 py-3">
                    <code className="min-w-0 flex-1 break-all text-sm text-ink">{url}</code>
                    <CopiarEnlace url={url} />
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-accent underline-offset-4 hover:underline">
                      Abrir
                    </a>
                  </div>

                  <p className="mb-2 mt-5 text-xs font-medium text-muted">Con origen de la visita</p>
                  <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {ORIGENES.map((o) => {
                      const u = `${url}?utm_source=${o.utm}`;
                      return (
                        <li key={o.utm} className="flex flex-wrap items-center gap-3 bg-bg px-4 py-2.5">
                          <span className="w-40 shrink-0 text-sm text-muted">{o.nombre}</span>
                          <code className="min-w-0 flex-1 break-all text-xs text-faint">{u}</code>
                          <CopiarEnlace url={u} />
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-faint">
                  Todavía no está lista. Cuando la publiquemos, el enlace aparece acá para copiar.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
