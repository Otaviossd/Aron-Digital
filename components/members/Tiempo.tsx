"use client";

import { useSyncExternalStore } from "react";
import { hace } from "@/lib/comentarios";

// Un solo reloj compartido por todos los "hace 5 min" de la pantalla (se actualiza cada 30 s).
const oyentes = new Set<() => void>();
let intervalo: ReturnType<typeof setInterval> | null = null;

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  if (!intervalo) intervalo = setInterval(() => oyentes.forEach((f) => f()), 30000);
  return () => {
    oyentes.delete(avisar);
    if (oyentes.size === 0 && intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  };
}
const instante = () => Math.floor(Date.now() / 30000) * 30000;
const instanteServidor = () => 0;

// En el servidor (y al hidratar) muestra la fecha fija; ya en el navegador, el tiempo relativo.
export default function Tiempo({ fecha }: { fecha: string }) {
  const ahora = useSyncExternalStore(suscribir, instante, instanteServidor);
  const texto =
    ahora === 0
      ? new Date(fecha).toLocaleDateString("es-PY", { day: "numeric", month: "short", timeZone: "America/Asuncion" })
      : hace(fecha, ahora);
  return (
    <time dateTime={fecha} className="text-xs text-faint">
      {texto}
    </time>
  );
}
