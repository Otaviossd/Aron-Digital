"use client";

import { useEffect, useRef } from "react";

// Firma visual del curso: un degradé hecho de líneas (gruesas arriba, finas abajo) que se mueve como una ola.
// Es el mismo dibujo de la intro de las clases. Se pausa cuando no está en pantalla y respeta "reducir movimiento".
export default function Olas({ className = "", lineas = 22, opacidad = 0.16 }: { className?: string; lineas?: number; opacidad?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ancho = 0;
    let alto = 0;
    let cuadro = 0;
    let visible = true;
    let ultimo = 0;

    const medir = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = r.width;
      alto = r.height;
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const dibujar = (t: number) => {
      ctx.clearRect(0, 0, ancho, alto);
      const fase = t * 0.00045;
      const amp = Math.max(10, alto * 0.022);
      for (let i = 0; i < lineas; i++) {
        const f = i / (lineas - 1);
        const y0 = alto * (0.06 + f * 0.88);
        const grosor = 7 * Math.pow(1 - f, 1.4) + 0.8;
        ctx.beginPath();
        for (let x = 0; x <= ancho + 16; x += 16) {
          const y = y0 + amp * Math.sin(x / 260 + fase * 6 + i * 0.33) * (0.6 + 0.4 * Math.sin(i * 0.9));
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = grosor;
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(57,255,126,${opacidad})`;
        ctx.stroke();
      }
    };

    const ciclo = (t: number) => {
      cuadro = requestAnimationFrame(ciclo);
      if (!visible || t - ultimo < 33) return; // ~30 cuadros por segundo alcanza
      ultimo = t;
      dibujar(t);
    };

    medir();
    dibujar(0);
    const alCambiar = () => {
      medir();
      dibujar(performance.now());
    };
    const ro = new ResizeObserver(alCambiar);
    ro.observe(cv);
    const io = new IntersectionObserver((e) => {
      visible = e[0]?.isIntersecting ?? true;
    });
    io.observe(cv);
    if (!quieto) cuadro = requestAnimationFrame(ciclo);

    return () => {
      cancelAnimationFrame(cuadro);
      ro.disconnect();
      io.disconnect();
    };
  }, [lineas, opacidad]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
