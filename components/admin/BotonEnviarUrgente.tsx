"use client";

import { useActionState } from "react";
import { enviarUrgenteCheckout, type ResultadoUrgente } from "@/app/admin/email/actions";
import { ui } from "@/lib/ui";

export default function BotonEnviarUrgente() {
  const [estado, accion, enviando] = useActionState(enviarUrgenteCheckout, {} as ResultadoUrgente);
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (!confirm("¿Mandar ya este email a todos los que llegaron al checkout y todavía no compraron? No se puede deshacer.")) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-start gap-2"
    >
      <button disabled={enviando} className={ui.boton}>
        {enviando ? "Enviando…" : "Enviar ahora a los pendientes"}
      </button>
      {estado.error && (
        <p role="alert" className="text-sm text-red-300">
          {estado.error}
        </p>
      )}
      {estado.ok && !enviando && <p className="text-sm text-accent">{estado.ok}</p>}
    </form>
  );
}
