import { Suspense } from "react";
import Link from "next/link";
import { getMemberData } from "@/lib/members";
import { EXTRA } from "@/lib/config";
import { ui } from "@/lib/ui";

export default function ExtraPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Extra />
    </Suspense>
  );
}

async function Extra() {
  const { supabase } = await getMemberData();
  const { data } = await supabase.rpc("tiene_extra");
  const tiene = data === true;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/aulas" className="text-sm text-muted transition hover:text-ink">
        ← Volver al curso
      </Link>
      <p className="mt-6 text-xs font-medium text-accent">Clase extra</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{EXTRA.titulo}</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">{EXTRA.descripcion}</p>

      {tiene ? (
        <div className="mt-8">
          {EXTRA.videoUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-black">
              <iframe src={EXTRA.videoUrl} title={EXTRA.titulo} allow="fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">La clase se publica muy pronto. Vas a verla acá mismo.</p>
          )}
        </div>
      ) : (
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink/90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <p className="mt-4 font-medium tracking-tight">Esta clase no está incluida en tu acceso</p>
          <p className="mt-1 text-sm text-muted">Pago único de US${EXTRA.valor} (antes US${EXTRA.valorAntes}). Precio especial para alumnos. Se abre acá mismo apenas se confirma el pago.</p>
          {EXTRA.checkoutUrl ? (
            <a href={EXTRA.checkoutUrl} className={`${ui.boton} mt-6`}>
              Desbloquear por US${EXTRA.valor} · antes US${EXTRA.valorAntes}
            </a>
          ) : (
            <span className={`${ui.boton} mt-6 cursor-not-allowed opacity-50`}>Disponible pronto</span>
          )}
          <p className="mt-4 text-xs text-faint">Comprá con el mismo email de tu cuenta para que se abra automáticamente.</p>
        </div>
      )}
    </div>
  );
}
