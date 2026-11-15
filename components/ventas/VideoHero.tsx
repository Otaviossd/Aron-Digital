"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Botón "Mirá el video" del inicio de la página de ventas. Al tocarlo abre el video de Aaron en grande, encima de la página.
// Solo aparece si existe NEXT_PUBLIC_VIDEO_VENTAS (enlace "embed" de Bunny/YouTube/Vimeo o un archivo .mp4/.webm).
export default function VideoHero({ url }: { url?: string }) {
  const [abierto, setAbierto] = useState(false);
  const enlace = (url ?? "").trim();

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  if (!enlace) return null;
  const esArchivo = /\.(mp4|webm)(\?|$)/i.test(enlace);
  const conAutoplay = esArchivo
    ? enlace
    : `${enlace}${enlace.includes("?") ? "&" : "?"}autoplay=true`;

  return (
    <>
      <div
        className="hero-in absolute inset-x-0 bottom-[7%] z-20 flex justify-center"
        style={{ ["--d" as string]: "700ms" }}
      >
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="cristal group flex items-center gap-3.5 rounded-full py-2 pl-2 pr-6 text-left transition duration-300 hover:border-accent/50 active:scale-[0.98]"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-black">
            <span
              aria-hidden="true"
              className="onda-play absolute inset-0 rounded-full bg-accent"
            />
            <svg
              viewBox="0 0 24 24"
              className="relative h-4 w-4 translate-x-px"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">
              Mirá el video
            </span>
            <span className="block text-xs text-muted">
              Aaron te cuenta el curso en 1 minuto
            </span>
          </span>
        </button>
      </div>

      {/* Se dibuja directamente en <body> para quedar por encima de toda la página (barra de compra incluida) */}
      {abierto &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Video de Aaron Dalla Rosa"
            className="entra fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          >
            <div
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar el video"
                className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-lg text-ink transition hover:bg-white/10"
              >
                ✕
              </button>
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_40px_120px_-30px_rgba(57,255,126,.35)]">
                {esArchivo ? (
                  <video
                    src={enlace}
                    controls
                    autoPlay
                    playsInline
                    className="aspect-video w-full bg-black"
                  />
                ) : (
                  <iframe
                    src={conAutoplay}
                    title="Aaron Dalla Rosa presenta el curso"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    className="aspect-video w-full bg-black"
                  />
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
