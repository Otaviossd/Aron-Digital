"use client";

import { useState } from "react";

// Dos pestañas (Clase / Comentarios). Los dos paneles quedan montados: al volver no se pierde lo escrito.
export default function Pestanas({
  inicial = "clase",
  clase,
  comentarios,
}: {
  inicial?: "clase" | "comentarios";
  clase: React.ReactNode;
  comentarios: React.ReactNode;
}) {
  const [activa, setActiva] = useState(inicial);
  const boton = (id: "clase" | "comentarios", texto: string) => (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={activa === id}
      aria-controls={`panel-${id}`}
      onClick={() => setActiva(id)}
      className={`relative px-1 pb-3 text-sm font-medium transition ${activa === id ? "text-ink" : "text-faint hover:text-ink"}`}
    >
      {texto}
      <span
        className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent transition-all duration-300 ${activa === id ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
      />
    </button>
  );

  return (
    <div className="mt-8">
      <div role="tablist" className="flex gap-7 border-b border-line">
        {boton("clase", "Sobre la clase")}
        {boton("comentarios", "Comentarios")}
      </div>
      <div id="panel-clase" role="tabpanel" aria-labelledby="tab-clase" hidden={activa !== "clase"} className="pt-6">
        {clase}
      </div>
      <div id="panel-comentarios" role="tabpanel" aria-labelledby="tab-comentarios" hidden={activa !== "comentarios"} className="pt-6">
        {comentarios}
      </div>
    </div>
  );
}
