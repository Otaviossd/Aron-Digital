import { CHECKOUT_URLS, DIAS_UPGRADE_TRIAL, EXTRA, PRECOS } from "@/lib/config";
import { ui } from "@/lib/ui";
import CuentaRegresiva from "@/components/CuentaRegresiva";

// Banner para quien entró por el funil de US$1 (Módulo 1 + 2 clases del Módulo 2): le muestra, bien
// claro, cuánto ahorra si pasa a la promo de lanzamiento antes de que se cierren los 3 días.
export default function UpgradeTrial({ email, compradoEn }: { email: string; compradoEn: string | null }) {
  const fin = compradoEn ? new Date(new Date(compradoEn).getTime() + DIAS_UPGRADE_TRIAL * 86400000).toISOString() : null;
  const ahorroCurso = PRECOS.vitalicio.valor - PRECOS.promo.valor;
  const valorTotal = PRECOS.vitalicio.valor + EXTRA.valorAntes;
  const ahorroTotal = ahorroCurso + EXTRA.valorAntes;
  const porcentajeOff = Math.round((ahorroTotal / valorTotal) * 100);

  const href = (() => {
    const base = CHECKOUT_URLS.promo; // el upsell siempre manda a la oferta de lanzamiento, nunca a la de US$1
    if (!base) return null;
    try {
      const u = new URL(base);
      u.searchParams.set("email", email.trim().toLowerCase());
      return u.toString();
    } catch {
      return base;
    }
  })();

  return (
    <div className="cristal relative mb-8 overflow-hidden rounded-3xl p-6 sm:p-8">
      <div aria-hidden="true" className="respirar absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-[100px]" />
      <div aria-hidden="true" className="respirar absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-cyan-400/15 blur-[90px] [animation-delay:-3s]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Esto es solo una muestra
          </span>
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Llevate el curso <span className="texto-luz">completo y de por vida</span> con {porcentajeOff}% OFF.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Todos los módulos, clases en vivo con Aaron, comunidad de barberos y certificado — más el módulo «{EXTRA.titulo}» (US${EXTRA.valorAntes}) totalmente de regalo.
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-faint line-through">US${valorTotal}</span>
            <span className="text-4xl font-black tracking-tight text-accent sm:text-5xl">US${PRECOS.promo.valor}</span>
            <span className="text-sm text-muted">pago único · ahorrás US${ahorroTotal}</span>
          </p>
          {fin && (
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-medium text-muted">Este precio se cierra en:</p>
              <CuentaRegresiva fin={fin} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 lg:items-center">
          {href ? (
            <a href={href} className={`${ui.boton} brillo-boton px-8 py-4 text-base shadow-[0_18px_55px_-12px_rgba(57,255,126,.85)] sm:min-w-[15rem]`}>
              <span className="relative">Quiero el acceso completo</span>
            </a>
          ) : null}
          <p className="text-center text-xs text-faint lg:max-w-[15rem]">Pago único, sin mensualidades. Se abre al instante con tu mismo email.</p>
        </div>
      </div>
    </div>
  );
}
