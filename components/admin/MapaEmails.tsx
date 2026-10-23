"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Arista, FichaEmail, Nodo, TipoNodo } from "@/lib/emails/mapa";

const W = 240;
const HE = 214; // alto de un nodo de email (con miniatura)
const HN = 76; // alto de los demás nodos
const GX = 278;
const GY = 250;
const PAD = 28;
const MINI = (W - 20) / 600; // escala de la miniatura
const ALTO_MINI = 124; // alto visible de la miniatura
const ZOOM_VIVO = 0.45; // por debajo de este zoom no se cargan los emails (el mapa se mueve más fluido)

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
  const [abierto, setAbierto] = useState<string | null>(null); // id de nodo email abierto
  const [pantalla, setPantalla] = useState(false);
  const [escala, setEscala] = useState(0.6);
  const caja = useRef<HTMLDivElement>(null);
  const [visibles, setVisibles] = useState<Set<string>>(new Set());
  const [montado, setMontado] = useState(false);
  const elementos = useRef(new Map<string, HTMLElement>());
  useEffect(() => setMontado(true), []);

  const porId = useMemo(() => new Map(nodos.map((n) => [n.id, n])), [nodos]);
  const ancho = PAD * 2 + (Math.max(...nodos.map((n) => n.col)) + 1) * GX - (GX - W);
  const largo = PAD * 2 + (Math.max(...nodos.map((n) => n.row)) + 1) * GY - (GY - HE);
  const lista = useMemo(() => nodos.filter((n) => n.email), [nodos]);
  const actual = abierto ? porId.get(abierto) : undefined;
  const ficha = actual?.email ? emails[actual.email] : undefined;
  const indice = abierto ? lista.findIndex((n) => n.id === abierto) : -1;

  const ajustar = useCallback(() => {
    if (!caja.current) return;
    setEscala(Math.max(0.3, Math.min(1, (caja.current.clientWidth - 8) / ancho)));
  }, [ancho]);

  useEffect(() => {
    ajustar();
  }, [ajustar, pantalla]);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (abierto) setAbierto(null);
        else if (pantalla) setPantalla(false);
      } else if (abierto && e.key === "ArrowRight" && indice < lista.length - 1) setAbierto(lista[indice + 1].id);
      else if (abierto && e.key === "ArrowLeft" && indice > 0) setAbierto(lista[indice - 1].id);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto, pantalla, indice, lista]);

  useEffect(() => {
    document.body.style.overflow = pantalla || abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [pantalla, abierto]);

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
        <span className="text-faint">Tocá un email para verlo completo.</span>
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
              const vivo = escala >= ZOOM_VIVO && visibles.has(n.id);
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
                  <button type="button" onClick={() => setAbierto(n.id)} className="block w-full text-left">
                    <span className="flex items-start gap-2">
                      {f && <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${f.estado === "activo" ? "bg-emerald-400" : "bg-amber-400"}`} />}
                      <span className="line-clamp-2 text-[13px] font-medium leading-tight tracking-tight text-ink">{n.titulo}</span>
                    </span>
                    {n.sub && <span className="mt-0.5 block truncate text-[11px] text-faint">{n.sub}</span>}
                  </button>
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
                      <button
                        type="button"
                        onClick={() => setAbierto(n.id)}
                        className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-ink backdrop-blur transition hover:bg-accent hover:text-black"
                      >
                        Ampliar
                      </button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {actual && montado && createPortal(
        <div className="fixed inset-0 z-[100] flex items-stretch justify-center overflow-hidden bg-black/80 p-2 sm:p-6" onClick={() => setAbierto(null)}>
          <div className="flex min-w-0 max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
              <h2 className="text-base font-semibold tracking-tight">{actual.titulo}</h2>
              {ficha && (
                <span className={`rounded-full px-3 py-1 text-xs ${ficha.estado === "activo" ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>
                  {ficha.estado === "activo" ? "Ya sale hoy" : "Propuesta"}
                </span>
              )}
              <span className="ml-auto flex items-center gap-2">
                {ficha && (
                  <>
                    <button type="button" className={btn} disabled={indice <= 0} onClick={() => setAbierto(lista[indice - 1].id)}>← Anterior</button>
                    <span className="text-xs text-faint">{indice + 1} / {lista.length}</span>
                    <button type="button" className={btn} disabled={indice >= lista.length - 1} onClick={() => setAbierto(lista[indice + 1].id)}>Siguiente →</button>
                  </>
                )}
                <button type="button" className={btn} onClick={() => setAbierto(null)}>Cerrar</button>
              </span>
            </div>
            {ficha ? (
              <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-0 overflow-auto lg:grid-cols-[320px_minmax(0,1fr)] lg:grid-rows-1 lg:overflow-hidden">
                <dl className="space-y-4 overflow-auto border-b border-line p-5 text-sm lg:border-b-0 lg:border-r">
                  <div>
                    <dt className="text-xs font-medium text-faint">Asunto</dt>
                    <dd className="mt-0.5 text-ink">{ficha.asunto}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-faint">Cuándo sale</dt>
                    <dd className="mt-0.5 text-muted">{ficha.cuando}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-faint">Objetivo</dt>
                    <dd className="mt-0.5 text-muted">{ficha.objetivo}</dd>
                  </div>
                  {ficha.nota && (
                    <div>
                      <dt className="text-xs font-medium text-faint">Para revisar</dt>
                      <dd className="mt-0.5 text-amber-200/90">{ficha.nota}</dd>
                    </div>
                  )}
                </dl>
                <div className="min-h-0 bg-black">
                  <iframe title={ficha.asunto} srcDoc={ficha.html} sandbox="" className="block h-full min-h-[520px] w-full" />
                </div>
              </div>
            ) : (
              <p className="max-w-2xl p-6 text-sm leading-relaxed text-muted">{actual.detalle}</p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}