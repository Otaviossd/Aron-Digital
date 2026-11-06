"use client";

import { useState } from "react";

export default function BotonCopiar({ texto, etiqueta = "Copiar enlace", className = "" }: { texto: string; etiqueta?: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1800);
        } catch {
          window.prompt("Copiá el enlace:", texto);
        }
      }}
    >
      {copiado ? "¡Copiado!" : etiqueta}
    </button>
  );
}
