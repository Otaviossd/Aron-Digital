import Link from "next/link";
import type { ModuloEstado } from "@/lib/members";

type Props = {
  modulo: ModuloEstado;
  numero: number;
  progreso: number; // 0-100
  totalAulas: number;
};

function diasHasta(fecha: string) {
  const ms = new Date(fecha).getTime() - Date.now();
  return Math.max(1, Math.ceil(ms / 86400000));
}

// Capa vertical de módulo. Usa a imagem do módulo; sem imagem, gera uma capa tipográfica discreta
// com a cor do módulo em tom suave.
export default function CoverCard({ modulo, numero, progreso, totalAulas }: Props) {
  const bloqueado = !modulo.is_unlocked;
  const accent = /^#[0-9a-fA-F]{6}$/.test(modulo.accent) ? modulo.accent : "#cdb48a";
  const dias = modulo.unlock_at ? diasHasta(modulo.unlock_at) : null;

  const tarjeta = (
    <div
      className={`group relative aspect-[3/4] w-[176px] shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-surface transition duration-300 sm:w-[212px] ${
        bloqueado ? "" : "hover:-translate-y-1 hover:border-line-strong"
      }`}
    >
      {/* Fondo */}
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
          className={`absolute inset-0 ${bloqueado ? "grayscale" : ""}`}
          style={{
            background: `radial-gradient(110% 70% at 50% 0%, ${accent}38 0%, transparent 62%), linear-gradient(180deg, #151517 0%, #0a0a0a 100%)`,
          }}
        >
          <span
            className="absolute -right-2 top-4 select-none text-[10rem] font-extralight leading-none tracking-tighter"
            style={{ color: "transparent", WebkitTextStroke: `1px ${accent}66` }}
          >
            {numero}
          </span>
        </div>
      )}

      {/* Degradado para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      {bloqueado && <div className="absolute inset-0 bg-black/55" />}

      {/* Etiqueta */}
      <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-ink/90 backdrop-blur">
        Módulo {numero}
      </span>

      {/* Candado */}
      {bloqueado && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-ink/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {dias !== null && (
            <span className="px-3 text-xs font-medium text-ink/80">
              Se libera en {dias} {dias === 1 ? "día" : "días"}
            </span>
          )}
        </div>
      )}

      {/* Título */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-semibold leading-tight tracking-tight">{modulo.title}</h3>
        {!bloqueado && (
          <>
            <p className="mt-1 text-xs text-muted">
              {totalAulas} {totalAulas === 1 ? "clase" : "clases"}
              {progreso > 0 && ` · ${progreso}%`}
            </p>
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-accent" style={{ width: `${progreso}%` }} />
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
