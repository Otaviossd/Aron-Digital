"use client";

import { useActionState } from "react";
import { enviarUrgenteALead, type ResultadoEnvioLead } from "@/app/admin/email/actions";

const VARIANTES = [1, 2, 3] as const;

// Fila de botones (uno por variante de la "copy matadora") para un contacto puntual de la tabla
// "Últimos contactos". Ya enviada una variante a este contacto, su botón pasa a mostrar "✓ enviado"
// y queda deshabilitado (la restricción única en el servidor igual lo frenaría, esto es solo para
// no tentar un segundo click).
export default function EnviarUrgenteFila({ leadId, enviados }: { leadId: string; enviados: number[] }) {
  const [estado, accion, enviando] = useActionState(enviarUrgenteALead, {} as ResultadoEnvioLead);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1.5">
        {VARIANTES.map((v) => {
          const yaEnviado = enviados.includes(v);
          return (
            <form
              key={v}
              action={accion}
              onSubmit={(e) => {
                if (!yaEnviado && !confirm(`¿Mandar el email ${v} a este contacto ahora?`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="lead_id" value={leadId} />
              <input type="hidden" name="variante" value={v} />
              <button
                disabled={yaEnviado || enviando}
                className={
                  yaEnviado
                    ? "rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent"
                    : "rounded-full border border-line-strong px-2.5 py-1 text-[11px] font-medium text-muted transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {yaEnviado ? `Email ${v} ✓` : `Enviar email ${v}`}
              </button>
            </form>
          );
        })}
      </div>
      {estado.error && <p className="text-[11px] text-red-300">{estado.error}</p>}
      {estado.ok && !enviando && <p className="text-[11px] text-accent">{estado.ok}</p>}
    </div>
  );
}
