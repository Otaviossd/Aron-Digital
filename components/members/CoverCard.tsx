import Link from "next/link";
import type { ModuloEstado } from "@/lib/members";
import { diasRestantes } from "@/lib/members";
import { FOTOS_PORTADA } from "@/lib/fotos";

type Props = {
  modulo: ModuloEstado;
  numero: number;
  progreso: number; // 0-100
  totalAulas: number;
};

// Capa vertical de módulo (estilo catálogo). Usa la imagen del módulo; sin imagen, una foto del Aaron
// teñida con el color del módulo.
export default function CoverCard({ modulo, numero, progreso, totalAulas }: Props) {
  const bloqueado = !modulo.is_unlocked;
  // Módulo "oculto" (sin grabar todavía, o que no queremos adelantar): bloqueado, sin ninguna foto,
  // solo el texto genérico ("Corte exclusivo…") y cuándo se libera.
  const sinFoto = bloqueado && modulo.oculto;
  const accent = /^#[0-9a-fA-F]{6}$/.test(modulo.accent) ? modulo.accent : "#39ff7e";
  const foto = FOTOS_PORTADA[(numero - 1) % FOTOS_PORTADA.length];

  const tarjeta = (
    <div
      className={`group relative aspect-[3/4] w-full snap-start overflow-hidden rounded-xl border border-line bg-surface transition duration-300 sm:w-[212px] sm:shrink-0 ${
        bloqueado ? "" : "hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_20px_60px_-12px_rgba(57,255,126,.5)]"
      }`}
    >
      {sinFoto ? (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-black/40" />
      ) : modulo.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={modulo.cover_url} alt="" className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${bloqueado ? "" : "group-hover:scale-[1.04]"}`} />
      ) : (
        <div
          className={`absolute inset-0 bg-cover bg-center transition duration-500 ${bloqueado ? "" : "group-hover:scale-[1.05]"}`}
          style={{ backgroundImage: `url(${foto})` }}
        />
      )}

      {/* Tinte del color del módulo + degradado para legibilidad */}
      {!modulo.cover_url && !sinFoto && <div className="absolute inset-0 mix-blend-soft-light" style={{ background: `linear-gradient(160deg, ${accent}aa, transparent 70%)` }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

      <span className="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-ink/90 backdrop-blur">
        {modulo.is_live ? "En vivo" : modulo.is_bonus ? "Bono" : `Módulo ${numero}`}
      </span>

      {bloqueado && (
        <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ink/80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <h3 className="text-[15px] font-semibold leading-tight tracking-tight sm:text-lg">{modulo.title}</h3>
        {bloqueado ? (
          modulo.unlock_at && <p className="mt-1 text-xs font-medium text-ink/70">Se libera {diasRestantes(modulo.unlock_at)}</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted">
              {totalAulas} {totalAulas === 1 ? "clase" : "clases"}
              {progreso > 0 && ` · ${progreso}%`}
            </p>
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-[#b6ff5c] shadow-[0_0_10px_rgba(57,255,126,.7)]" style={{ width: `${progreso}%` }} />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return bloqueado ? (
    <div aria-label={`${modulo.title} (bloqueado)`} className="block shrink-0 cursor-not-allowed">
      {tarjeta}
    </div>
  ) : (
    <Link href={`/aulas/modulo/${modulo.id}`} className="block shrink-0">{tarjeta}</Link>
  );
}
