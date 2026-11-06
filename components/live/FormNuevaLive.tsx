"use client";

import { useActionState } from "react";
import { crearLive, type EstadoLive } from "@/app/admin/live/actions";
import { ui } from "@/lib/ui";

export default function FormNuevaLive() {
  const [estado, accion, enviando] = useActionState(crearLive, {} as EstadoLive);
  return (
    <form action={accion} className="space-y-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div>
        <label className={ui.rotulo} htmlFor="titulo">
          Título de la clase en vivo
        </label>
        <input id="titulo" name="titulo" required maxLength={120} placeholder="Ej.: Resolviendo dudas de degradé" className={ui.campo} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.rotulo} htmlFor="programada_para">
            Fecha y hora (hora de Paraguay)
          </label>
          <input id="programada_para" name="programada_para" type="datetime-local" className={ui.campo} />
        </div>
        <div>
          <label className={ui.rotulo} htmlFor="video_url">
            Enlace del directo (YouTube)
          </label>
          <input id="video_url" name="video_url" placeholder="https://www.youtube.com/live/…" className={ui.campo} />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-faint">
        Para programarla alcanza con el título y la fecha; el enlace se puede agregar después. Para iniciar ahora hace falta el enlace.
      </p>
      <div className="flex flex-wrap gap-3">
        <button name="accion" value="programar" disabled={enviando} className={ui.botonSuave}>
          Programar
        </button>
        <button name="accion" value="iniciar" disabled={enviando} className={ui.boton}>
          {enviando ? "Guardando…" : "Iniciar ahora"}
        </button>
      </div>
      {estado.error && (
        <p role="alert" className="text-sm text-red-300">
          {estado.error}
        </p>
      )}
      {estado.ok && !enviando && <p className="text-sm text-accent">{estado.ok}</p>}
    </form>
  );
}
