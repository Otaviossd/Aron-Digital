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
    return <p className="text-acid">Suscripción cancelada. Mantenés el acceso hasta el fin del período pagado.</p>;

  if (estado === "confirmar")
    return (
      <div className="flex items-center gap-3">
        <span>¿Seguro que querés cancelar?</span>
        <button onClick={cancelar} className="border border-white/40 px-3 py-1 uppercase tracking-widest hover:border-acid hover:text-acid">
          Sí, cancelar
        </button>
        <button onClick={() => setEstado("idle")} className="uppercase tracking-widest text-white/60">
          Volver
        </button>
      </div>
    );

  return (
    <>
      <button
        onClick={() => setEstado("confirmar")}
        disabled={estado === "enviando"}
        className="underline hover:text-acid"
      >
        Cancelar suscripción
      </button>
      {estado === "erro" && <span className="ml-3 text-red-400">No se pudo cancelar. Intentá de nuevo.</span>}
    </>
  );
}
