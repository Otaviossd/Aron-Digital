"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";

export default function CopiarEnlace({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      window.prompt("Copiá el enlace:", url);
    }
  }

  return (
    <button type="button" onClick={copiar} className={ui.botonChico}>
      {copiado ? "¡Copiado!" : "Copiar"}
    </button>
  );
}
