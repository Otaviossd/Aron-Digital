"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Arista, FichaEmail, Nodo, TipoNodo } from "@/lib/emails/mapa";

const W = 290;
const HE = 286; // alto de un nodo de email (con miniatura)
const HN = 76; // alto de los demás nodos
const GX = 330;
const GY = 322;
const PAD = 28;
const MINI = (W - 20) / 600; // escala de la miniatura
const ALTO_MINI = 214; // alto visible de la miniatura


const estilos: Record<TipoNodo, string> = {
  origen: "border-white/25 bg-white/[0.05]",
  pagina: "border-accent/50 bg-accent/[0.08]",
  accion: "border-line-strong bg-surface",
  email: "border-line bg-surface hover:border-accent/60",
  bien: "border-emerald-400/60 bg-emerald-400/10",
  mal: "border-amber-400/60 bg-amber-400/10",
  frio: "border-sky-400/60 bg-sky-400/10",
};

const alto = (n: Nodo) => (n.email ? HE : HN);
const px = (n: Nodo) => PAD + n.col * GX;
const py = (n: Nodo) => PAD + n.row * GY + (HE - alto(n)) / 2;

function camino(a: Nodo, b: Nodo) {
  const ax = px(a), ay = py(a), bx = px(b), by = py(b);
  if (bx >= ax + W) {
    const x1 = ax + W, y1 = ay + alto(a) / 2, x2 = bx, y2 = by + alto(b) / 2;
    const dx = Math.max(32, (x2 - x1) / 2);
    return { d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
  }
  const abajo = by > ay;
  const x1 = ax + W / 2, y1 = abajo ? ay + alto(a) : ay;
  const x2 = bx + W / 2, y2 = abajo ? by : by + alto(b);
  const dy = abajo ? 60 : -60;
  return { d: `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

type Props = { nodos: Nodo[]; aristas: Arista[]; emails: Record<string, FichaEmail> };

export default function MapaEmails({ nodos, aristas, emails }: Props) {
  const [pantalla, setPantalla] = useState(false);
  const [escala, setEscala] = useState(0.7);
  const caja = useRef<HTMLDivElement>(null);
  const [visibles, setVisibles] = useState<Set<string>>(new Set());
  const elementos = useRef(new Map<string, HTMLElement>());

  const porId = useMemo(() => new Map(nodos.map((n) => [n.id, n])), [nodos]);
  const ancho = PAD * 2 + (Math.max(...nodos.map((n) => n.col)) + 1) * GX - (GX - W);
  const largo = PAD * 2 + (Math.max(...nodos.map((n) => n.row)) + 1) * GY - (GY - HE);

  const ajustar = useCallback(() => {
    if (!caja.current) return;
    setEscala(Math.max(0.3, Math.min(1, (caja.current.clientWidth - 8) / ancho)));
  }, [ancho]);


  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape" && pantalla) setPantalla(false);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [pantalla]);

  useEffect(() => {
    document.body.style.overflow = pantalla ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [pantalla]);

  // Solo se cargan los emails que están a la vista (y con el mapa lo bastante acercado): evita que el sitio se trabe.
  useEffect(() => {
    if (!caja.current) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        setVisibles((prev) => {
          const sig = new Set(prev);
          for (const e of entradas) {
            const id = (e.target as HTMLElement).dataset.id!;
            if (e.isIntersecting) sig.add(id);
            else sig.delete(id);
          }
          return sig;
        });
      },
      { root: caja.current, rootMargin: "200px" },
    );
    elementos.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pantalla, nodos]);

  const zoom = (f: number) => setEscala((e) => Math.max(0.25, Math.min(1.4, +(e * f).toFixed(3))));
  const btn = "rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-white/5";

  return (
    <div className={pantalla ? "fixed inset-0 z-50 flex flex-col bg-bg p-4" : ""}>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Ya sale hoy</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> Propuesta (para aprobar)</span>
        <span className="flex items-center gap-2"><span className="h-px w-5 border-t border-dashed border-muted" /> Camino alternativo</span>
        <span className="text-faint">Cada email se ve en su cuadro: rodá con el mouse sobre él para leerlo completo.</span>
        <span className="ml-auto flex items-center gap-2">
          <button type="button" className={btn} onClick={() => zoom(0.85)} aria-label="Alejar">−</button>
          <span className="w-10 text-center tabular-nums">{Math.round(escala * 100)}%</span>
          <button type="button" className={btn} onClick={() => zoom(1.15)} aria-label="Acercar">+</button>
          <button type="button" className={btn} onClick={ajustar}>Ajustar</button>
          <button type="button" className={`${btn} border-accent/50 text-accent`} onClick={() => setPantalla((v) => !v)}>
            {pantalla ? "Salir de pantalla completa" : "Pantalla completa"}
          </button>
        </span>
      </div>

      <div ref={caja} className="overflow-auto rounded-2xl border border-line bg-bg" style={pantalla ? { flex: 1 } : { height: "72vh" }}>
        <div style={{ width: ancho * escala, height: largo * escala }}>
          <div className="relative origin-top-left" style={{ width: ancho, height: largo, transform: `scale(${escala})` }}>
            <svg width={ancho} height={largo} className="absolute inset-0" aria-hidden="true">
              <defs>
                <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,1 L9,5 L0,9 z" fill="#5d686d" />
                </marker>
              </defs>
              {aristas.map((a, i) => {
                const de = porId.get(a.de);
                const hasta = porId.get(a.a);
                if (!de || !hasta) return null;
                const c = camino(de, hasta);
                return (
                  <g key={i}>
                    <path d={c.d} fill="none" stroke="#5d686d" strokeWidth="1.6" strokeDasharray={a.punteada ? "6 6" : undefined} markerEnd="url(#flecha)" />
                    {a.etiqueta && (
                      <text x={c.mx} y={c.my - 6} textAnchor="middle" fontSize="12" fill="#c4cacd" stroke="#07090a" strokeWidth="5" paintOrder="stroke">
                        {a.etiqueta}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {nodos.map((n) => {
              const f = n.email ? emails[n.email] : undefined;
              const vivo = visibles.has(n.id);
              return (
                <div
                  key={n.id}
                  data-id={n.id}
                  ref={(el) => {
                    if (el) elementos.current.set(n.id, el);
                    else elementos.current.delete(n.id);
                  }}
                  style={{ left: px(n), top: py(n), width: W, height: alto(n) }}
                  className={`absolute flex flex-col rounded-xl border p-2.5 text-left transition ${estilos[n.tipo]} ${n.email ? "" : "justify-center px-3.5"}`}
                >
                  <div className="block w-full text-left">
                    <span className="flex items-start gap-2">
                      {f && <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${f.estado === "activo" ? "bg-emerald-400" : "bg-amber-400"}`} />}
                      <span className="line-clamp-2 text-[13px] font-medium leading-tight tracking-tight text-ink">{n.titulo}</span>
                    </span>
                    {n.sub && <span className="mt-0.5 block truncate text-[11px] text-faint">{n.sub}</span>}
                  </div>
                  {f && (
                    <span className="relative mt-1.5 block overflow-hidden rounded-md bg-black" style={{ height: ALTO_MINI }}>
                      {vivo ? (
                        <iframe
                          title={`Miniatura: ${f.asunto}`}
                          srcDoc={f.html}
                          sandbox=""
                          className="absolute left-0 top-0 border-0"
                          style={{ width: 600, height: ALTO_MINI / MINI, transform: `scale(${MINI})`, transformOrigin: "top left" }}
                        />
                      ) : (
                        <span className="flex h-full flex-col gap-1.5 p-2.5" aria-hidden="true">
                          <span className="h-1.5 w-3/5 rounded bg-accent/40" />
                          <span className="h-1 w-full rounded bg-white/15" />
                          <span className="h-1 w-5/6 rounded bg-white/15" />
                          <span className="h-1 w-4/6 rounded bg-white/15" />
                          <span className="mt-auto h-3 w-1/3 rounded-full bg-accent/50" />
                        </span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
