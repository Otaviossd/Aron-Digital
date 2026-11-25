"use client";

import { useEffect, useRef, useState } from "react";

// dimsD: ancho/alto reales de la captura de computadora, si son distintos del tamaño estándar (1800x1125).
export type Escena = { id: string; titulo: string; texto: string; dimsD?: [number, number] };

const SEGUNDOS = 6;

// "El curso por dentro": capturas reales de la plataforma (vista del alumno), en computadora y celular.
// Las pantallas pasan solas cada 6 segundos mientras la sección está a la vista; al tocar una pestaña, queda fija.
// Las imágenes están en /public/curso (<id>-d.webp = computadora, <id>-m.webp = celular).
export default function Recorrido({ escenas }: { escenas: Escena[] }) {
  const [activa, setActiva] = useState(0);
  const [auto, setAuto] = useState(true);
  const [enVista, setEnVista] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((e) => setEnVista(e[0]?.isIntersecting ?? false), { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const corre = auto && enVista;
  useEffect(() => {
    if (!corre || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setActiva((a) => (a + 1) % escenas.length), SEGUNDOS * 1000);
    return () => clearTimeout(id);
  }, [activa, corre, escenas.length]);

  const elegir = (i: number) => {
    setAuto(false);
    setActiva(i);
  };

  return (
    <div ref={ref}>
      <div role="tablist" aria-label="Pantallas del curso" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {escenas.map((e, i) => {
          const esActiva = i === activa;
          return (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={esActiva}
              onClick={() => elegir(i)}
              className={`relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition duration-300 active:scale-[0.98] lg:px-5 lg:py-4 ${
                esActiva ? "border-accent/40 bg-accent/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/25"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`text-xs font-semibold tabular-nums transition ${esActiva ? "text-accent" : "text-faint"}`}>0{i + 1}</span>
                <span className={`text-sm font-medium tracking-tight transition sm:text-base ${esActiva ? "text-ink" : "text-muted"}`}>{e.titulo}</span>
              </span>
              {esActiva && (
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
                  <span key={`${activa}-${corre}`} className={`block h-full origin-left bg-accent ${corre ? "barra-recorrido" : ""}`} style={{ animationDuration: `${SEGUNDOS}s` }} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p key={activa} className="entra mx-auto mt-6 min-h-[4.5rem] max-w-2xl text-center text-sm leading-relaxed text-muted sm:min-h-[3.25rem] sm:text-base">
        {escenas[activa].texto}
      </p>

      <div className="mx-auto mt-6 max-w-5xl">
        <div className="relative md:pb-10 md:pr-[4%]">
          <div
            aria-hidden="true"
            className="luz pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2"
            style={{ ["--luz" as string]: "rgba(57,255,126,.13)" }}
          />
          <div className="relative grid">
            {escenas.map((e, i) => {
              const esActiva = i === activa;
              return (
                <div
                  key={e.id}
                  aria-hidden={!esActiva}
                  className={`relative col-start-1 row-start-1 transition duration-700 ease-out ${esActiva ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
                >
                  {/* Computadora */}
                  <div className="hidden overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0b0c0d] shadow-[0_40px_120px_-40px_rgba(0,0,0,.95)] md:block">
                    <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-2.5">
                      <span className="h-2 w-2 rounded-full bg-white/15" />
                      <span className="h-2 w-2 rounded-full bg-white/15" />
                      <span className="h-2 w-2 rounded-full bg-white/15" />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/curso/${e.id}-d.webp`}
                      alt={`${e.titulo}: la plataforma en la computadora`}
                      width={e.dimsD?.[0] ?? 1800}
                      height={e.dimsD?.[1] ?? 1125}
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                  </div>
                  {/* Celular */}
                  <div
                    className={`relative mx-auto w-[72%] max-w-[290px] overflow-hidden rounded-[2rem] border-[6px] border-[#1c1e20] bg-black shadow-[0_30px_90px_-25px_rgba(0,0,0,.95)] transition duration-700 ease-out md:absolute md:-bottom-10 md:-right-[4.5%] md:mx-0 md:w-[22%] md:max-w-none md:rounded-[1.4rem] md:border-[4px] ${
                      esActiva ? "" : "md:translate-y-4"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/curso/${e.id}-m.webp`} alt={`${e.titulo}: la plataforma en el celular`} width={585} height={1266} loading="lazy" className="block h-auto w-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
