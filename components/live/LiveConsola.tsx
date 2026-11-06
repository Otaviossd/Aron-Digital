"use client";

import { useState } from "react";
import { aEmbed } from "@/lib/video";
import type { LiveActual, MensajeLive } from "@/lib/live";
import { ui } from "@/lib/ui";
import { terminarLive } from "@/app/admin/live/actions";
import LiveChat from "./LiveChat";

// Consola de Aaron durante el directo: chat en vivo para leer preguntas y responder, gente conectada y botón de terminar.
export default function LiveConsola({ live, mensajes, yo }: { live: LiveActual; mensajes: MensajeLive[]; yo: { nombre: string; avatar: string | null } }) {
  const [espectadores, setEspectadores] = useState(0);
  const [terminando, setTerminando] = useState(false);
  const url = aEmbed(live.video_url);

  return (
    <div className="overflow-hidden rounded-3xl border border-[#ff3d71]/40 bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ff3d71] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 animate-ping rounded-full bg-white" />
          En vivo
        </span>
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">{live.titulo}</h2>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
          <span className="font-semibold tabular-nums text-ink">{espectadores}</span> conectados
        </span>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
            {url ? <iframe src={url} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Vista previa del directo" /> : null}
          </div>
          <p className="text-xs leading-relaxed text-faint">
            Esta es la vista previa (puede tener unos segundos de retraso). Aaron transmite desde YouTube; acá lee las preguntas del chat y responde con el sello de instructor.
          </p>

          {!terminando ? (
            <button type="button" onClick={() => setTerminando(true)} className={ui.botonPeligro}>
              Terminar la clase en vivo
            </button>
          ) : (
            <form action={terminarLive} className="space-y-4 rounded-2xl border border-red-400/30 bg-red-400/[0.04] p-5">
              <input type="hidden" name="id" value={live.id} />
              <p className="text-sm font-medium">¿Terminar la clase en vivo?</p>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" name="publicar" defaultChecked className="mt-1 h-4 w-4 accent-[#39ff7e]" />
                <span>
                  <span className="font-medium">Publicar la grabación automáticamente</span>
                  <span className="mt-0.5 block text-xs text-faint">
                    Se crea la clase “Clase en vivo del día…” en el módulo Clases en vivo, disponible para todos los alumnos, también para quienes compren después.
                  </span>
                </span>
              </label>
              <div>
                <label className={ui.rotulo} htmlFor="grabacion_url">
                  Enlace de la grabación (opcional)
                </label>
                <input id="grabacion_url" name="grabacion_url" placeholder="Si lo dejás vacío se usa el mismo enlace del directo" className={ui.campo} />
                <p className="mt-1.5 text-xs text-faint">YouTube convierte el directo en grabación solo; puede tardar unos minutos en estar lista.</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full bg-red-400 px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-red-300">Sí, terminar</button>
                <button type="button" onClick={() => setTerminando(false)} className={ui.botonSuave}>
                  Seguir en vivo
                </button>
              </div>
            </form>
          )}
        </div>

        <LiveChat liveId={live.id} inicial={mensajes} yo={yo} admin onEspectadores={setEspectadores} className="h-[30rem] lg:h-[34rem]" />
      </div>
    </div>
  );
}
