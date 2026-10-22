"use client";

import { useEffect, useRef } from "react";

// Envuelve un bloque y lo hace aparecer suavemente cuando entra en pantalla.
// Sin JavaScript (o con "reducir movimiento") el bloque se ve normal.
export default function Aparece({ children, retraso = 0, className = "" }: { children: React.ReactNode; retraso?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("visto");
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("visto");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`aparece ${className}`} style={{ ["--retraso" as string]: `${retraso}ms` }}>
      {children}
    </div>
  );
}
