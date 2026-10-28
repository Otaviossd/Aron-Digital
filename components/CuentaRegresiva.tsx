"use client";

import { useEffect, useState } from "react";

// Cuenta regresiva hacia una fecha real (la misma para todos). Se muestra recién después de cargar la página.
export default function CuentaRegresiva({ fin }: { fin: string }) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const inicio = setTimeout(() => setAhora(Date.now()), 0);
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => {
      clearTimeout(inicio);
      clearInterval(t);
    };
  }, []);

  const objetivo = new Date(fin).getTime();
  if (ahora === null || Number.isNaN(objetivo) || objetivo <= ahora) return null;

  const total = Math.floor((objetivo - ahora) / 1000);
  const partes = [
    { v: Math.floor(total / 86400), l: "días" },
    { v: Math.floor((total % 86400) / 3600), l: "horas" },
    { v: Math.floor((total % 3600) / 60), l: "min" },
    { v: total % 60, l: "seg" },
  ];

  return (
    <div className="flex items-center justify-center gap-2" role="timer" aria-label="Tiempo que queda de la oferta de lanzamiento">
      {partes.map((p) => (
        <div key={p.l} className="min-w-[3.6rem] rounded-xl border border-accent/30 bg-black/40 px-2 py-2 text-center">
          <span className="block text-2xl font-semibold tabular-nums tracking-tight">{String(p.v).padStart(2, "0")}</span>
          <span className="block text-[10px] uppercase tracking-wider text-faint">{p.l}</span>
        </div>
      ))}
    </div>
  );
}
