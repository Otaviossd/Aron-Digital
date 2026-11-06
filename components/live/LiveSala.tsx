"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { aEmbed } from "@/lib/video";
import { cuando, cuentaAtras, type LiveActual, type MensajeLive } from "@/lib/live";
import LiveChat from "./LiveChat";

type Props = {
  inicial: LiveActual | null;
  mensajes: MensajeLive[];
  yo: { nombre: string; avatar: string | null };
  // módulo donde quedan las grabaciones (si ya existe)
  moduloGrabaciones: string | null;
};

export default function LiveSala({ inicial, mensajes, yo, moduloGrabaciones }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [live, setLive] = useState<LiveActual | null>(inicial);
  const [ahora, setAhora] = useState(0);

  // Pregunta cada 10 s si la clase empezó o terminó: la pantalla cambia sola, sin recargar.
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden) return;
      const { data } = await supabase.rpc("live_actual");
      const fila = (Array.isArray(data) ? data[0] : null) as LiveActual | null;
      setLive((actual) => (actual?.id === fila?.id && actual?.estado === fila?.estado && actual?.video_url === fila?.video_url && actual?.lesson_id === fila?.lesson_id ? actual : fila));
    }, 10000);
    return () => clearInterval(id);
  }, [supabase]);

  useEffect(() => {
    const tick = () => setAhora(Date.now());
    const primero = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(primero);
      clearInterval(id);
    };
  }, []);

  if (!live) {
    return (
      <Estado icono="🎥" titulo="No hay ninguna clase en vivo programada" texto="Cuando Aaron programe la próxima, aparece acá con la fecha y la hora. Mientras tanto, mirá las clases en vivo anteriores.">
        {moduloGrabaciones && (
          <Link href={`/aulas/modulo/${moduloGrabaciones}`} className="neon mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold">
            Ver clases en vivo grabadas
          </Link>
        )}
      </Estado>
    );
  }

  if (live.estado === "programada") {
    const faltan = live.programada_para && ahora ? (new Date(live.programada_para).getTime() - ahora) / 1000 : null;
    return (
      <Estado icono="⏰" titulo={live.titulo} texto={live.programada_para ? `Empieza el ${cuando(live.programada_para)}` : "Aaron va a avisar la fecha muy pronto."}>
        {faltan !== null && faltan > 0 && (
          <p className="mt-6 inline-flex rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm font-semibold tabular-nums text-accent">Empieza en {cuentaAtras(faltan)}</p>
        )}
        {faltan !== null && faltan <= 0 && <p className="mt-6 text-sm text-muted">Ya casi empieza. Dejá esta pantalla abierta: se activa sola.</p>}
        <p className="mt-5 max-w-sm text-xs leading-relaxed text-faint">Dejá esta pantalla abierta: cuando Aaron empiece, el video y el chat aparecen solos. Después queda grabada para verla cuando quieras.</p>
      </Estado>
    );
  }

  if (live.estado === "terminada") {
    return (
      <Estado icono="✅" titulo="La clase en vivo terminó" texto="Gracias por estar. La grabación completa ya queda en tu área de clases para que la veas cuando quieras.">
        {live.lesson_id ? (
          <Link href={`/aulas/${live.lesson_id}`} className="neon mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold">
            Ver la grabación
          </Link>
        ) : (
          moduloGrabaciones && (
            <Link href={`/aulas/modulo/${moduloGrabaciones}`} className="neon mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold">
              Ver clases en vivo grabadas
            </Link>
          )
        )}
      </Estado>
    );
  }

  const url = aEmbed(live.video_url);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ff3d71] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 animate-ping rounded-full bg-white" />
          En vivo
        </span>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{live.titulo}</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
          {url ? (
            <iframe key={live.id} src={url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={live.titulo} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-faint">Preparando la transmisión…</div>
          )}
        </div>
        <LiveChat key={live.id} liveId={live.id} inicial={live.id === inicial?.id ? mensajes : []} yo={yo} className="h-[26rem] lg:h-auto lg:max-h-[calc((100vw-18rem)*0.5)] lg:min-h-[26rem]" />
      </div>
    </div>
  );
}

function Estado({ icono, titulo, texto, children }: { icono: string; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-accent/[0.14] blur-[80px]" />
      <span className="relative text-4xl" aria-hidden="true">
        {icono}
      </span>
      <h2 className="relative mt-5 text-xl font-semibold tracking-tight sm:text-2xl">{titulo}</h2>
      <p className="relative mt-3 text-sm leading-relaxed text-muted">{texto}</p>
      <div className="relative flex flex-col items-center">{children}</div>
    </div>
  );
}
