"use client";

import { useEffect, useState } from "react";

// Cuenta regresiva compacta, en una sola línea ("11h 32m"), para meter dentro de una franja o pastilla
// (a diferencia de CuentaRegresiva, que ocupa 4 casilleros). Misma fecha real para todos: PROMO_FIN.
export default function CuentaCorta({ fin }: { fin: string }) {
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
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const texto = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}min` : `${m}min ${String(s).padStart(2, "0")}s`;

  return <span className="tabular-nums">{texto}</span>;
}
