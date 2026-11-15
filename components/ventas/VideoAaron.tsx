"use client";

import { useState } from "react";

// Video corto de Aaron en el inicio de la página de ventas.
// - Sin enlace (NEXT_PUBLIC_VIDEO_VENTAS vacío): se ve solo el retrato sobre el panel verde, sin botón de play.
// - Con enlace: aparece el botón; al tocarlo, el video se carga y se reproduce en el mismo marco.
//   Acepta un enlace "embed" (Bunny, YouTube, Vimeo) o un archivo .mp4/.webm.
export default function VideoAaron({ url, retrato }: { url?: string; retrato: string }) {
  const [abierto, setAbierto] = useState(false);
  const enlace = (url ?? "").trim();
  const esArchivo = /\.(mp4|webm)(\?|$)/i.test(enlace);
  const conAutoplay = enlace && !esArchivo ? `${enlace}${enlace.includes("?") ? "&" : "?"}autoplay=true` : enlace;

  return (
    <div className="marco-v">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[6px] bg-accent">
        {abierto && enlace ? (
          esArchivo ? (
            <video src={enlace} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
          ) : (
            <iframe src={conAutoplay} title="Aaron Dalla Rosa presenta el curso" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen className="absolute inset-0 h-full w-full bg-black" />
          )
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={retrato} alt="Aaron Dalla Rosa" width={900} height={1500} fetchPriority="high" className="absolute bottom-0 left-1/2 h-[96%] w-auto max-w-none -translate-x-1/2 object-contain" />
            <span className="display absolute left-4 top-4 text-[13px] tracking-[0.04em] text-black/80">La Nueva Ola Academy</span>
            {enlace ? (
              <button type="button" onClick={() => setAbierto(true)} aria-label="Ver el video de Aaron" className="group absolute inset-0 flex items-end justify-start p-4 text-left">
                <span className="flex items-center gap-3 rounded-[10px] bg-black/85 py-2.5 pl-2.5 pr-5 transition group-hover:bg-black">
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent text-black">
                    <span className="pulso-v absolute inset-0 rounded-full bg-accent" />
                    <svg viewBox="0 0 24 24" className="relative h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true">
                      <path d="M7 4.5v15l13-7.5z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold tracking-tight text-ink">Mira a Aaron</span>
                    <span className="block text-xs text-muted">Te cuenta el curso en 1 minuto</span>
                  </span>
                </span>
              </button>
            ) : (
              <span className="absolute bottom-4 left-4 rounded-[10px] bg-black/85 px-4 py-2.5">
                <span className="block text-sm font-semibold tracking-tight text-ink">Aaron Dalla Rosa</span>
                <span className="block text-xs text-muted">Barbero y educador</span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
