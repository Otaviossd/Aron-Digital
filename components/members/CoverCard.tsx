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

// Capa vertical de módulo. Usa a imagem do módulo; sem imagem, gera uma capa tipográfica com a cor de destaque.
export default function CoverCard({ modulo, numero, progreso, totalAulas }: Props) {
  const bloqueado = !modulo.is_unlocked;
  const accent = /^#[0-9a-fA-F]{6}$/.test(modulo.accent) ? modulo.accent : "#d4ff00";

  const tarjeta = (
    <div
      className={`group relative aspect-[3/4] w-[190px] shrink-0 snap-start overflow-hidden border border-white/10 bg-black transition duration-300 sm:w-[220px] ${
        bloqueado ? "" : "hover:-translate-y-1 hover:border-white/40"
      }`}
      style={bloqueado ? undefined : { boxShadow: `0 0 0 0 ${accent}` }}
    >
      {/* Fondo */}
      {modulo.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={modulo.cover_url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            bloqueado ? "scale-105 blur-[2px] grayscale" : "group-hover:scale-105"
          }`}
        />
      ) : (
        <div
          className={`absolute inset-0 ${bloqueado ? "grayscale" : ""}`}
          style={{
            background: `radial-gradient(120% 80% at 50% 0%, ${accent}55 0%, transparent 60%), linear-gradient(180deg, #111 0%, #000 100%)`,
          }}
        >
          <span
            className="absolute -right-3 top-6 select-none text-[11rem] font-black leading-none"
            style={{ color: "transparent", WebkitTextStroke: `2px ${accent}55` }}
          >
            {numero}
          </span>
        </div>
      )}

      {/* Degradado para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      {bloqueado && <div className="absolute inset-0 bg-black/55" />}

      {/* Etiqueta */}
      <span
        className="absolute left-3 top-3 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black"
        style={{ background: bloqueado ? "#888" : accent }}
      >
        Módulo {numero}
      </span>

      {/* Candado */}
      {bloqueado && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="1" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {modulo.unlock_at && (
            <span className="px-3 text-[11px] font-bold uppercase tracking-widest text-white/80">
              Se libera en {diasHasta(modulo.unlock_at)} {diasHasta(modulo.unlock_at) === 1 ? "día" : "días"}
            </span>
          )}
        </div>
      )}

      {/* Título */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-xl font-black uppercase leading-[1.05] tracking-tight sm:text-2xl">{modulo.title}</h3>
        {!bloqueado && (
          <>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
              {totalAulas} {totalAulas === 1 ? "clase" : "clases"}
            </p>
            <div className="mt-3 h-1 w-full bg-white/15">
              <div className="h-full" style={{ width: `${progreso}%`, background: accent }} />
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
