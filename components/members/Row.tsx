"use client";

import { useRef } from "react";

// Fileira horizontal com setas, estilo "streaming".
export default function Row({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mover = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section className="mb-10 border border-white/10 bg-[#141414] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">{titulo}</h2>
          {subtitulo && <p className="text-xs text-white/40">{subtitulo}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              onClick={() => mover(d)}
              aria-label={d === 1 ? "Siguiente" : "Anterior"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm hover:bg-acid hover:text-black"
            >
              {d === 1 ? "›" : "‹"}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
