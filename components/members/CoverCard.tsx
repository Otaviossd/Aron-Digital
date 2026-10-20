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
  const accent = /^#[0-9a-fA-F]{6}$/.test(modulo.accent) ? modulo.accent : "#39ff7e";
  const foto = FOTOS_PORTADA[(numero - 1) % FOTOS_PORTADA.length];

  const tarjeta = (
    <div
      className={`group relative aspect-[3/4] w-[176px] shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-surface transition duration-300 sm:w-[212px] ${
        bloqueado ? "" : "hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_20px_60px_-12px_rgba(57,255,126,.5)]"
      }`}
    >
      {modulo.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={modulo.cover_url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            bloqueado ? "scale-105 blur-[2px] grayscale" : "group-hover:scale-[1.04]"
          }`}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-cover bg-center transition duration-500 ${bloqueado ? "grayscale" : "group-hover:scale-[1.05]"}`}
          style={{ backgroundImage: `url(${foto})` }}
        />
      )}

      {/* Tinte del color del módulo + degradado para legibilidad */}
      {!modulo.cover_url && <div className="absolute inset-0 mix-blend-soft-light" style={{ background: `linear-gradient(160deg, ${accent}aa, transparent 70%)` }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
      {bloqueado && <div className="absolute inset-0 bg-black/55" />}

      <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-ink/90 backdrop-blur">
        {modulo.is_bonus ? "Bono" : `Módulo ${numero}`}
      </span>

      {bloqueado && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink/90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          {modulo.unlock_at && <span className="px-3 text-xs font-medium text-ink/85">Se libera {diasRestantes(modulo.unlock_at)}</span>}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-semibold leading-tight tracking-tight">{modulo.title}</h3>
        {!bloqueado && (
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
    <div aria-label={`${modulo.title} (bloqueado)`} className="cursor-not-allowed">
      {tarjeta}
    </div>
  ) : (
    <Link href={`/aulas/modulo/${modulo.id}`}>{tarjeta}</Link>
  );
}
