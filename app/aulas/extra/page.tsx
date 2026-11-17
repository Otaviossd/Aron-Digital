import { Suspense } from "react";
import Link from "next/link";
import { getMemberData } from "@/lib/members";
import { EXTRA } from "@/lib/config";
import { enlaceExtra, precioExtra, textoRestante, URLS_EXTRA } from "@/lib/extra";
import { ui } from "@/lib/ui";

export default function ExtraPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Extra />
    </Suspense>
  );
}

async function Extra() {
  const { supabase, email } = await getMemberData();
  const { data } = await supabase.rpc("tiene_extra");
  const tiene = data === true;

  // US$10 durante los primeros 15 días desde la compra del curso; después US$20.
  const { data: compras } = await supabase
    .from("subscriptions")
    .select("purchased_at")
    .is("refunded_at", null)
    .order("purchased_at", { ascending: true })
    .limit(1);
  const compraEn = compras?.[0]?.purchased_at ? new Date(compras[0].purchased_at) : null;
  const precio = precioExtra(compraEn, new Date());
  const enlace = enlaceExtra(precio.enOferta, URLS_EXTRA, email);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/aulas" className="text-sm text-muted transition hover:text-ink">
        ← Volver al curso
      </Link>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={EXTRA.portada} alt={EXTRA.titulo} width={1254} height={1254} fetchPriority="high" className="mt-6 aspect-square w-full max-w-sm rounded-2xl border border-accent/30 object-cover" />
      <p className="mt-6 text-xs font-medium text-accent">Módulo extra</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{EXTRA.titulo}</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">{EXTRA.descripcion}</p>

      {tiene ? (
        <div className="mt-8 space-y-3">
          {EXTRA.lecciones.map((l, i) => (
            <details key={i} className="group overflow-hidden rounded-2xl border border-line bg-surface open:border-accent/40">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-xs font-medium text-muted">{i + 1}</span>
                <span className="flex-1 font-medium tracking-tight">{l.titulo}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-faint transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="border-t border-line px-5 py-5">
                {l.videoUrl ? (
                  <div className="aspect-video overflow-hidden rounded-xl border border-line bg-black">
                    <iframe src={l.videoUrl} title={l.titulo} allow="fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />
                  </div>
                ) : (
                  <p className="text-sm text-muted">Esta clase se publica muy pronto. Vas a verla acá mismo.</p>
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink/90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <p className="mt-4 text-lg font-semibold tracking-tight">Desbloqueá este módulo extra</p>
          {precio.enOferta ? (
            <>
              <p className="mx-auto mt-3 inline-flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">US${precio.valor}</span>
                <span className="text-lg text-faint line-through">US${precio.valorAntes}</span>
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
                Precio especial de alumno, pago único.
                {precio.horasRestantes !== null && (
                  <>
                    {" "}
                    <strong className="text-accent">Te quedan {textoRestante(precio.horasRestantes)}</strong>: después vuelve a US${EXTRA.valorAntes}.
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="mx-auto mt-3 text-4xl font-semibold tracking-tight">US${precio.valor}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
                Pago único. El precio de alumno (US${EXTRA.valor}) duraba {EXTRA.diasPrecio} días desde tu compra y ya terminó, pero el módulo sigue disponible para vos.
              </p>
            </>
          )}
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">Se abre acá mismo apenas se confirma el pago.</p>
          {enlace ? (
            <a href={enlace} className={`${ui.boton} mt-6`}>
              Quiero el módulo extra
            </a>
          ) : (
            <span className={`${ui.boton} mt-6 cursor-not-allowed opacity-50`}>Disponible pronto</span>
          )}
          <p className="mt-4 text-xs text-faint">Pagá con el mismo email de tu cuenta y el módulo se abre solo.</p>
        </div>
      )}
    </div>
  );
}
