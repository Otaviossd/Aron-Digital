import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aulasDelModulo, diasRestantes, getMemberData } from "@/lib/members";
import { toggleCompletada } from "../actions";
import RegistrarVista from "@/components/members/RegistrarVista";
import { ui } from "@/lib/ui";

export default function AulaPage(props: PageProps<"/aulas/[id]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <AulaContenido params={props.params} />
    </Suspense>
  );
}

async function AulaContenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, modulos, aulas, completadas } = await getMemberData();

  // RLS: si el módulo todavía no se liberó (o la clase no se publicó), no aparece en `aulas`.
  const aula = aulas.find((a) => a.id === id);
  if (!aula || aula.is_unlocked === false) notFound();
  const modulo = modulos.find((m) => m.id === aula.module_id);
  if (!modulo) notFound();

  const { data: v } = await supabase.from("lessons").select("video_url").eq("id", id).maybeSingle();
  const url = (v?.video_url as string | null) ?? null;
  const esArchivo = url ? /\.(mp4|webm|mov)(\?|$)/i.test(url) : false;

  const lista = aulasDelModulo(aulas, modulo.id);
  const abiertas = lista.filter((a) => a.is_unlocked !== false);
  const idx = abiertas.findIndex((a) => a.id === id);
  const anterior = idx > 0 ? abiertas[idx - 1] : null;
  const siguiente = idx < abiertas.length - 1 ? abiertas[idx + 1] : null;
  const hecha = completadas.has(id);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <RegistrarVista lessonId={id} />
      <div>
        <Link href={`/aulas/modulo/${modulo.id}`} className="mb-5 inline-block text-sm text-muted transition hover:text-ink">
          ← {modulo.title}
        </Link>
        <h1 className="mb-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{aula.title}</h1>

        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
          {url ? (
            esArchivo ? (
              <video src={url} controls controlsList="nodownload" className="h-full w-full" />
            ) : (
              <iframe src={url} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-faint">
              El video de esta clase todavía no está disponible.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <form action={toggleCompletada.bind(null, id, hecha)}>
            <button className={hecha ? ui.botonSuave : ui.boton}>{hecha ? "✓ Completada" : "Marcar como completada"}</button>
          </form>
          {anterior && (
            <Link href={`/aulas/${anterior.id}`} className="px-3 py-3 text-sm text-muted transition hover:text-ink">
              ← Anterior
            </Link>
          )}
          {siguiente && (
            <Link href={`/aulas/${siguiente.id}`} className="px-3 py-3 text-sm font-medium text-accent transition hover:text-ink">
              Siguiente →
            </Link>
          )}
        </div>

        {aula.description && <p className="mt-8 max-w-2xl leading-relaxed text-muted">{aula.description}</p>}
      </div>

      <aside className="h-fit overflow-hidden rounded-2xl border border-line bg-surface">
        <h2 className="border-b border-line px-5 py-4 text-sm font-semibold tracking-tight">{modulo.title}</h2>
        <ul>
          {lista.map((a) =>
            a.is_unlocked === false ? (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm text-faint">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[10px]">🔒</span>
                <span className="flex-1">{a.title}</span>
                {a.unlock_at && <span className="text-xs">{diasRestantes(a.unlock_at)}</span>}
              </li>
            ) : (
              <li key={a.id}>
                <Link
                  href={`/aulas/${a.id}`}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition hover:bg-white/[0.03] ${
                    a.id === id ? "bg-white/[0.05] font-medium text-ink" : "text-muted"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      completadas.has(a.id) ? "border-accent bg-accent font-semibold text-bg" : "border-line-strong"
                    }`}
                  >
                    {completadas.has(a.id) ? "✓" : ""}
                  </span>
                  <span className="flex-1">{a.title}</span>
                  {a.duration_minutes && <span className="text-xs text-faint">{a.duration_minutes}′</span>}
                </Link>
              </li>
            ),
          )}
        </ul>
      </aside>
    </div>
  );
}
