import { CHECKOUT_URLS, DIAS_UPGRADE_TRIAL, EXTRA, PRECOS } from "@/lib/config";
import { ui } from "@/lib/ui";
import CuentaRegresiva from "@/components/CuentaRegresiva";

// Banner para quien entró por el funil de US$1 (Módulo 1 + 2 clases del Módulo 2): le recuerda que
// tiene DIAS_UPGRADE_TRIAL días para pasar a la promo de lanzamiento antes de que vuelva al precio normal.
export default function UpgradeTrial({ email, compradoEn }: { email: string; compradoEn: string | null }) {
  const fin = compradoEn ? new Date(new Date(compradoEn).getTime() + DIAS_UPGRADE_TRIAL * 86400000).toISOString() : null;
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
    <div className="cristal relative mb-8 overflow-hidden rounded-2xl p-5 sm:p-6">
      <div aria-hidden="true" className="respirar absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-[90px]" />
      <p className="relative mb-1 text-sm font-medium text-accent">Esto es solo una muestra</p>
      <h2 className="relative text-xl font-semibold tracking-tight sm:text-2xl">Desbloqueá el curso completo por US${PRECOS.promo.valor}</h2>
      <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Todos los módulos, clases en vivo con Aaron, comunidad, certificado y el módulo «{EXTRA.titulo}» de regalo. Tenés {DIAS_UPGRADE_TRIAL} días desde tu compra para
        pasar a este precio de lanzamiento — después vuelve al precio normal.
      </p>
      {fin && (
        <div className="relative mt-4">
          <CuentaRegresiva fin={fin} />
        </div>
      )}
      {href ? (
        <a href={href} className={`${ui.boton} relative mt-5 inline-flex px-6 py-3`}>
          Quiero el acceso completo
        </a>
      ) : null}
    </div>
  );
}
