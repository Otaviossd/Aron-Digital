import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";
import { Titulo } from "@/components/admin/ui";
import { apagarAula, apagarModulo, guardarAula, guardarModulo } from "../actions";

type Modulo = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  unlock_after_days: number;
  cover_url: string | null;
  accent: string;
  is_bonus: boolean;
};
type Aula = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  position: number;
  video_url: string | null;
  duration_minutes: number | null;
  published_at: string;
  unlock_after_days: number;
};

// datetime-local en horario de Asunción (UTC-03:00)
const paraInput = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16);

export default function ContenidoPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const supabase = await createClient();
  const [{ data: m }, { data: a }] = await Promise.all([
    supabase.from("modules").select("*").order("position"),
    supabase.from("lessons").select("*").order("position"),
  ]);
  const modulos = (m ?? []) as Modulo[];
  const aulas = (a ?? []) as Aula[];

  return (
    <>
      <Titulo
        titulo="Contenido"
        sub="Módulos y clases del curso. Los módulos se liberan solos según los días desde la compra; las clases pueden programarse (por ejemplo, el video de cada lunes)."
      />

      <div className="space-y-3">
        {modulos.map((mod) => {
          const lista = aulas.filter((x) => x.module_id === mod.id);
          return (
            <details key={mod.id} className="group rounded-2xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <span className="font-medium">
                  <span className="mr-3 text-faint">{mod.position}</span>
                  {mod.title}
                </span>
                <span className="text-xs text-faint">
                  {mod.is_bonus && "bono · "}{lista.length} clases · se abre el día {mod.unlock_after_days}
                </span>
              </summary>

              <div className="space-y-6 border-t border-line p-5">
                <form action={guardarModulo} encType="multipart/form-data" className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="id" value={mod.id} />
                  <div className="sm:col-span-2">
                    <label className={ui.rotulo}>Título</label>
                    <input name="title" defaultValue={mod.title} required className={ui.campo} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={ui.rotulo}>Descripción</label>
                    <input name="description" defaultValue={mod.description ?? ""} className={ui.campo} />
                  </div>
                  <div>
                    <label className={ui.rotulo}>Orden</label>
                    <input name="position" type="number" defaultValue={mod.position} className={ui.campo} />
                  </div>
                  <div>
                    <label className={ui.rotulo}>Se libera el día (desde la compra)</label>
                    <input name="unlock_after_days" type="number" min={0} defaultValue={mod.unlock_after_days} className={ui.campo} />
                  </div>
                  <div>
                    <label className={ui.rotulo}>Color del módulo</label>
                    <input name="accent" defaultValue={mod.accent} placeholder="#cdb48a" className={ui.campo} />
                  </div>
                  <div>
                    <label className={ui.rotulo}>Portada (URL)</label>
                    <input name="cover_url" defaultValue={mod.cover_url ?? ""} className={ui.campo} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={ui.rotulo}>O subir una portada nueva (vertical, 3:4, sin texto en la imagen)</label>
                    <input name="cover_file" type="file" accept="image/*" className="text-xs text-muted" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input name="is_bonus" type="checkbox" defaultChecked={mod.is_bonus} className="h-4 w-4 accent-[#cdb48a]" />
                      Es un bono (aparece en la fila “Bonos”; ponele día 7 para bloquearlo 7 días)
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <button className={ui.botonChico}>Guardar módulo</button>
                  </div>
                </form>
                <form action={apagarModulo}>
                  <input type="hidden" name="id" value={mod.id} />
                  <button className={ui.botonPeligro}>Borrar módulo y sus clases</button>
                </form>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-accent">Clases</h3>
                  {lista.map((aula) => (
                    <details key={aula.id} className="rounded-xl border border-line bg-bg">
                      <summary className="flex cursor-pointer list-none justify-between gap-3 px-4 py-3 text-sm">
                        <span>
                          <span className="mr-2 text-faint">{aula.position}</span>
                          {aula.title}
                        </span>
                        <span className="text-xs text-faint">{new Date(aula.published_at) > new Date() ? "programada" : "publicada"}</span>
                      </summary>
                      <FormAula moduloId={mod.id} aula={aula} />
                    </details>
                  ))}

                  <details className="rounded-xl border border-dashed border-line-strong">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-accent">+ Nueva clase</summary>
                    <FormAula moduloId={mod.id} />
                  </details>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <details className="mt-4 rounded-2xl border border-dashed border-line-strong">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-accent">+ Nuevo módulo</summary>
        <form action={guardarModulo} encType="multipart/form-data" className="grid gap-4 border-t border-line p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={ui.rotulo}>Título</label>
            <input name="title" required className={ui.campo} />
          </div>
          <div className="sm:col-span-2">
            <label className={ui.rotulo}>Descripción</label>
            <input name="description" className={ui.campo} />
          </div>
          <div>
            <label className={ui.rotulo}>Orden</label>
            <input name="position" type="number" defaultValue={modulos.length + 1} className={ui.campo} />
          </div>
          <div>
            <label className={ui.rotulo}>Se libera el día (desde la compra)</label>
            <input name="unlock_after_days" type="number" min={0} defaultValue={0} className={ui.campo} />
          </div>
          <div>
            <label className={ui.rotulo}>Color del módulo</label>
            <input name="accent" defaultValue="#cdb48a" className={ui.campo} />
          </div>
          <div>
            <label className={ui.rotulo}>Portada (URL)</label>
            <input name="cover_url" className={ui.campo} />
          </div>
          <div className="sm:col-span-2">
            <label className={ui.rotulo}>O subir una portada (vertical, 3:4)</label>
            <input name="cover_file" type="file" accept="image/*" className="text-xs text-muted" />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input name="is_bonus" type="checkbox" className="h-4 w-4 accent-[#cdb48a]" />
              Es un bono (aparece en la fila “Bonos”; ponele día 7 para bloquearlo 7 días)
            </label>
          </div>
          <div className="sm:col-span-2">
            <button className={ui.botonChico}>Crear módulo</button>
          </div>
        </form>
      </details>
    </>
  );
}

function FormAula({ moduloId, aula }: { moduloId: string; aula?: Aula }) {
  return (
    <div className="space-y-3 border-t border-line p-4">
      <form action={guardarAula} className="grid gap-4 sm:grid-cols-2">
        {aula && <input type="hidden" name="id" value={aula.id} />}
        <input type="hidden" name="module_id" value={moduloId} />
        <div className="sm:col-span-2">
          <label className={ui.rotulo}>Título</label>
          <input name="title" defaultValue={aula?.title} required className={ui.campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={ui.rotulo}>Descripción</label>
          <textarea name="description" defaultValue={aula?.description ?? ""} rows={2} className={ui.campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={ui.rotulo}>Video (archivo .mp4 o enlace de incrustación/embed)</label>
          <input name="video_url" defaultValue={aula?.video_url ?? ""} className={ui.campo} />
        </div>
        <div>
          <label className={ui.rotulo}>Orden</label>
          <input name="position" type="number" defaultValue={aula?.position ?? 0} className={ui.campo} />
        </div>
        <div>
          <label className={ui.rotulo}>Se libera el día (0 = con el módulo)</label>
          <input name="unlock_after_days" type="number" min={0} defaultValue={aula?.unlock_after_days ?? 0} className={ui.campo} />
        </div>
        <div>
          <label className={ui.rotulo}>Duración (min)</label>
          <input name="duration_minutes" type="number" defaultValue={aula?.duration_minutes ?? ""} className={ui.campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={ui.rotulo}>Publicar el (vacío = publicar ahora; usalo para el video de cada lunes)</label>
          <input name="published_at" type="datetime-local" defaultValue={aula ? paraInput(aula.published_at) : ""} className={ui.campo} />
        </div>
        <div className="sm:col-span-2">
          <button className={ui.botonChico}>{aula ? "Guardar clase" : "Crear clase"}</button>
        </div>
      </form>
      {aula && (
        <form action={apagarAula}>
          <input type="hidden" name="id" value={aula.id} />
          <button className={ui.botonPeligro}>Borrar clase</button>
        </form>
      )}
    </div>
  );
}
