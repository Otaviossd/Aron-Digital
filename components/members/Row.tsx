"use client";

import { useRef } from "react";

// Móvil: cuadrícula de 2 columnas que llena el ancho. Desde sm: fila horizontal con flechas, estilo "streaming".
export default function Row({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mover = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
          {subtitulo && <p className="mt-0.5 text-sm text-faint">{subtitulo}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              onClick={() => mover(d)}
              aria-label={d === 1 ? "Siguiente" : "Anterior"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-sm text-muted transition hover:bg-white/5 hover:text-ink"
            >
              {d === 1 ? "›" : "‹"}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} className="grid grid-cols-2 gap-3 sm:flex sm:snap-x sm:gap-4 sm:overflow-x-auto sm:pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
