import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMemberData } from "@/lib/members";
import { cuando, type LiveActual, type MensajeLive } from "@/lib/live";
import { Pildora, Seccion, Titulo } from "@/components/admin/ui";
import { ui } from "@/lib/ui";
import FormNuevaLive from "@/components/live/FormNuevaLive";
import LiveConsola from "@/components/live/LiveConsola";
import { eliminarLive, iniciarLive, publicarGrabacion } from "./actions";

export default function AdminLivePage() {
  return (
    <>
      <Titulo
        titulo="Clases en vivo"
        sub="Aaron transmite por YouTube (en modo “No listado”) y acá controla el chat. Al terminar, la grabación se publica sola en el módulo Clases en vivo."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/[0.03]" />}>
        <Contenido />
      </Suspense>
    </>
  );
}

type Fila = LiveActual & { created_at: string };

async function Contenido() {
  const supabase = await createClient();
  const { nombre, avatarUrl } = await getMemberData();
  const { data, error } = await supabase.from("lives").select("*").order("created_at", { ascending: false }).limit(40);

  if (error) {
    return (
      <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-6 text-sm text-amber-200">
        Faltan las tablas de la plataforma v2. Ejecutá <code className="font-mono">supabase/plataforma-v2.sql</code> en el SQL Editor de Supabase.
      </p>
    );
  }

  const lives = (data ?? []) as Fila[];
  const enVivo = lives.find((l) => l.estado === "en_vivo") ?? null;
  const programadas = lives.filter((l) => l.estado === "programada").sort((a, b) => (a.programada_para ?? "9").localeCompare(b.programada_para ?? "9"));
  const terminadas = lives.filter((l) => l.estado === "terminada");

  let mensajes: MensajeLive[] = [];
  if (enVivo) {
    const { data: filas } = await supabase
      .from("live_mensajes")
      .select("id, live_id, autor_id, autor_nombre, autor_avatar, es_instructor, cuerpo, created_at")
      .eq("live_id", enVivo.id)
      .order("id", { ascending: false })
      .limit(100);
    mensajes = ((filas ?? []) as MensajeLive[]).reverse();
  }

  return (
    <>
      {enVivo && (
        <Seccion titulo="En vivo ahora">
          <LiveConsola live={enVivo} mensajes={mensajes} yo={{ nombre, avatar: avatarUrl }} />
        </Seccion>
      )}

      {!enVivo && (
        <Seccion titulo="Nueva clase en vivo" sub="Programala con anticipación (los alumnos ven la cuenta regresiva) o iniciála ahora.">
          <FormNuevaLive />
          <details className="mt-4 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
            <summary className="cursor-pointer font-medium text-ink">¿Cómo transmite Aaron? (3 pasos)</summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
              <li>En YouTube Studio → “Crear” → “Emitir en directo”. En visibilidad elegí <b>No listado</b> (así solo entra quien tenga acceso al curso).</li>
              <li>Copiá el enlace de la transmisión y pegalo arriba.</li>
              <li>Tocá “Iniciar ahora” cuando Aaron salga al aire. Los alumnos que estén en la pestaña “En vivo” ven el video y el chat al instante.</li>
            </ol>
          </details>
        </Seccion>
      )}

      {programadas.length > 0 && (
        <Seccion titulo="Programadas">
          <ul className="space-y-3">
            {programadas.map((l) => (
              <li key={l.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.titulo}</p>
                    <p className="mt-0.5 text-xs text-faint">{l.programada_para ? cuando(l.programada_para) : "Sin fecha"}</p>
                  </div>
                  <Pildora tono={l.video_url ? "ok" : "aviso"}>{l.video_url ? "Con enlace" : "Falta el enlace"}</Pildora>
                </div>
                <form action={iniciarLive} className="mt-4 flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={l.id} />
                  <div className="min-w-[14rem] flex-1">
                    <label className={ui.rotulo}>{l.video_url ? "Cambiar enlace del directo (opcional)" : "Enlace del directo"}</label>
                    <input name="video_url" placeholder="https://www.youtube.com/live/…" className={ui.campo} />
                  </div>
                  <button className={ui.boton}>Iniciar ahora</button>
                  <button formAction={eliminarLive} className={ui.botonPeligro}>
                    Eliminar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {terminadas.length > 0 && (
        <Seccion titulo="Anteriores">
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {terminadas.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{l.titulo}</p>
                  <p className="mt-0.5 text-xs text-faint">{l.inicio_at ? cuando(l.inicio_at) : "—"}</p>
                </div>
                {l.lesson_id ? (
                  <>
                    <Pildora tono="ok">Grabación publicada</Pildora>
                    <Link href={`/aulas/${l.lesson_id}`} className="text-xs text-accent hover:underline">
                      Ver clase
                    </Link>
                  </>
                ) : (
                  <form action={publicarGrabacion} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <input name="grabacion_url" placeholder="Enlace de la grabación (opcional)" className={`${ui.campo} !w-56 !py-2`} />
                    <button className={ui.botonChico}>Publicar grabación</button>
                  </form>
                )}
                <form action={eliminarLive}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="text-xs text-faint transition hover:text-red-300">Eliminar</button>
                </form>
              </li>
            ))}
          </ul>
        </Seccion>
      )}
    </>
  );
}
