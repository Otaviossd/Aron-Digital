"use client";

import Link from "next/link";
import { useEnVivo } from "@/components/live/LiveProvider";

// Accesos rápidos de la home: clases en vivo, comunidad y certificado.
export default function Atajos({ porcentaje }: { porcentaje: number }) {
  const { enVivo } = useEnVivo();
  const tarjeta = "group relative flex flex-col items-start gap-2.5 overflow-hidden rounded-2xl border border-line bg-surface p-3.5 transition sm:flex-row sm:items-center sm:gap-3 sm:p-4 duration-300 hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.98]";
  const icono = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full";
  return (
    <section aria-label="Accesos rápidos" className="escalonado mb-12 grid grid-cols-3 gap-2.5 sm:gap-3">
      <Link href="/aulas/live" className={`${tarjeta} ${enVivo ? "border-[#ff3d71]/50" : ""}`}>
        <span className={`${icono} ${enVivo ? "bg-[#ff3d71]/20 text-[#ff7a9c]" : "bg-white/[0.06] text-muted"}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3V7zm14 3l4-2v8l-4-2" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">{enVivo ? "En vivo" : "Clases en vivo"}</span>
          <span className="hidden truncate text-xs text-faint sm:block">{enVivo ? "Entrá ahora y preguntá" : "Preguntá en directo"}</span>
        </span>
        {enVivo && <span className="absolute right-4 top-4 h-2 w-2 animate-ping rounded-full bg-[#ff3d71]" />}
      </Link>
      <Link href="/aulas/comunidad" className={tarjeta}>
        <span className={`${icono} bg-white/[0.06] text-muted`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm11 10v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">Comunidad</span>
          <span className="hidden truncate text-xs text-faint sm:block">Mostrá tus cortes</span>
        </span>
      </Link>
      <Link href="/aulas/certificado" className={tarjeta}>
        <span className={`${icono} bg-accent/15 text-accent`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-3.5-.5L7 22l5-3 5 3-1.5-7.5" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">Certificado</span>
          <span className="block truncate text-xs text-faint">{porcentaje >= 100 ? "¡Generalo!" : `${porcentaje} %`}</span>
        </span>
      </Link>
    </section>
  );
}
