"use client";

import { useEffect, useRef, useState } from "react";

// Número que sube de 0 a su valor cuando entra en pantalla (una sola vez).
// Sin JavaScript, o con "reducir movimiento", se ve directamente el valor final.
export default function Contador({ valor, prefijo = "", sufijo = "" }: { valor: number; prefijo?: string; sufijo?: string }) {
  const [n, setN] = useState(valor);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cuadro = 0;
    const obs = new IntersectionObserver(
      (e) => {
        if (!e[0]?.isIntersecting) return;
        obs.disconnect();
        const inicio = performance.now();
        const dura = 1300;
        const paso = (t: number) => {
          const k = Math.min(1, (t - inicio) / dura);
          setN(Math.round(valor * (1 - Math.pow(1 - k, 3))));
          if (k < 1) cuadro = requestAnimationFrame(paso);
        };
        cuadro = requestAnimationFrame(paso);
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [valor]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefijo}
      {n.toLocaleString("es-AR")}
      {sufijo}
    </span>
  );
}
