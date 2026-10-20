"use client";

import { useState } from "react";

export default function CancelButton() {
  const [estado, setEstado] = useState<"idle" | "confirmar" | "enviando" | "hecho" | "erro">("idle");

  async function cancelar() {
    setEstado("enviando");
    const res = await fetch("/api/cuenta/cancelar", { method: "POST" });
    setEstado(res.ok ? "hecho" : "erro");
  }

  if (estado === "hecho")
    return <p className="text-accent">Suscripción cancelada. Mantenés el acceso hasta el fin del período pagado.</p>;

  if (estado === "confirmar")
    return (
      <div className="flex items-center gap-3">
        <span>¿Seguro que querés cancelar?</span>
        <button onClick={cancelar} className="rounded-full border border-line-strong px-4 py-1.5 text-ink transition hover:bg-white/5">
          Sí, cancelar
        </button>
        <button onClick={() => setEstado("idle")} className="text-muted transition hover:text-ink">
          Volver
        </button>
      </div>
    );

  return (
    <>
      <button
        onClick={() => setEstado("confirmar")}
        disabled={estado === "enviando"}
        className="underline underline-offset-4 transition hover:text-ink"
      >
        Cancelar suscripción
      </button>
      {estado === "erro" && <span className="ml-3 text-red-300">No se pudo cancelar. Intentá de nuevo.</span>}
    </>
  );
}
