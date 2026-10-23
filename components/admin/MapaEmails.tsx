"use client";

import { useState } from "react";
import type { Arista, FichaEmail, Nodo, TipoNodo } from "@/lib/emails/mapa";

const W = 204;
const H = 78;
const GX = 244;
const GY = 128;
const PAD = 24;

const estilos: Record<TipoNodo, string> = {
  origen: "border-white/25 bg-white/[0.05]",
  pagina: "border-accent/50 bg-accent/[0.08]",
  accion: "border-line-strong bg-surface",
  email: "border-line bg-surface hover:border-accent/50",
  bien: "border-emerald-400/60 bg-emerald-400/10",
  mal: "border-amber-400/60 bg-amber-400/10",
};

const posicion = (n: Nodo) => ({ x: PAD + n.col * GX, y: PAD + n.row * GY });

function camino(a: Nodo, b: Nodo) {
  const pa = posicion(a);
  const pb = posicion(b);
  if (pb.x >= pa.x + W) {
    const x1 = pa.x + W;
    const y1 = pa.y + H / 2;
    const x2 = pb.x;
    const y2 = pb.y + H / 2;
    const dx = Math.max(36, (x2 - x1) / 2);
    return { d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
  }
  // hacia atrás: sale por abajo o por arriba y entra por el lado contrario
  const abajo = pb.y > pa.y;
  const x1 = pa.x + W / 2;
  const y1 = abajo ? pa.y + H : pa.y;
  const x2 = pb.x + W / 2;
  const y2 = abajo ? pb.y : pb.y + H;
  const dy = abajo ? 70 : -70;
  return { d: `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

type Props = { nodos: Nodo[]; aristas: Arista[]; emails: Record<string, FichaEmail> };

export default function MapaEmails({ nodos, aristas, emails }: Props) {
  const [sel, setSel] = useState<string>("L1");
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const ancho = PAD * 2 + (Math.max(...nodos.map((n) => n.col)) + 1) * GX - (GX - W);
  const alto = PAD * 2 + (Math.max(...nodos.map((n) => n.row)) + 1) * GY - (GY - H);
  const nodo = porId.get(sel);
  const ficha = nodo?.email ? emails[nodo.email] : undefined;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Ya sale hoy</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> Propuesta (para aprobar)</span>
        <span className="flex items-center gap-2"><span className="h-px w-5 border-t border-dashed border-muted" /> Camino alternativo</span>
        <span className="text-faint">Tocá un email para ver cómo lo recibe el alumno.</span>
      </div>

      <div className="overflow-auto rounded-2xl border border-line bg-bg" style={{ maxHeight: "72vh" }}>
        <div className="relative" style={{ width: ancho, height: alto }}>
          <svg width={ancho} height={alto} className="absolute inset-0" aria-hidden="true">
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
                  <path d={c.d} fill="none" stroke="#5d686d" strokeWidth="1.5" strokeDasharray={a.punteada ? "5 5" : undefined} markerEnd="url(#flecha)" />
                  {a.etiqueta && (
                    <text x={c.mx} y={c.my - 6} textAnchor="middle" fontSize="11" fill="#a9b0b3" stroke="#07090a" strokeWidth="4" paintOrder="stroke">
                      {a.etiqueta}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {nodos.map((n) => {
            const p = posicion(n);
            const ficha = n.email ? emails[n.email] : undefined;
            const activo = sel === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSel(n.id)}
                style={{ left: p.x, top: p.y, width: W, height: H }}
                className={`absolute flex flex-col justify-center rounded-xl border px-3.5 text-left transition ${estilos[n.tipo]} ${
                  activo ? "ring-2 ring-accent shadow-[0_0_30px_-8px_rgba(57,255,126,.6)]" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  {ficha && <span className={`h-2 w-2 shrink-0 rounded-full ${ficha.estado === "activo" ? "bg-emerald-400" : "bg-amber-400"}`} />}
                  <span className="line-clamp-2 text-[13px] font-medium leading-tight tracking-tight text-ink">{n.titulo}</span>
                </span>
                {n.sub && <span className="mt-1 truncate text-[11px] text-faint">{n.sub}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        {nodo && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">{nodo.titulo}</h2>
              {ficha && (
                <span className={`rounded-full px-3 py-1 text-xs ${ficha.estado === "activo" ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>
                  {ficha.estado === "activo" ? "Ya sale hoy" : "Propuesta"}
                </span>
              )}
            </div>
            {ficha ? (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <dl className="space-y-4 text-sm">
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
                <div className="overflow-hidden rounded-xl border border-line bg-black">
                  <iframe title={ficha.asunto} srcDoc={ficha.html} sandbox="" className="h-[760px] w-full" />
                </div>
              </div>
            ) : (
              <p className="max-w-2xl text-sm leading-relaxed text-muted">{nodo.detalle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
