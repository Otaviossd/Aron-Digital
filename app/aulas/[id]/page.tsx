import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aulasDelModulo, getMemberData } from "@/lib/members";
import { toggleCompletada } from "../actions";

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
  if (!aula) notFound();
  const modulo = modulos.find((m) => m.id === aula.module_id);
  if (!modulo) notFound();

  const { data: v } = await supabase.from("lessons").select("video_url").eq("id", id).maybeSingle();
  const url = (v?.video_url as string | null) ?? null;
  const esArchivo = url ? /\.(mp4|webm|mov)(\?|$)/i.test(url) : false;

  const lista = aulasDelModulo(aulas, modulo.id);
  const idx = lista.findIndex((a) => a.id === id);
  const anterior = idx > 0 ? lista[idx - 1] : null;
  const siguiente = idx < lista.length - 1 ? lista[idx + 1] : null;
  const hecha = completadas.has(id);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <div>
        <Link href={`/aulas/modulo/${modulo.id}`} className="mb-4 inline-block text-xs uppercase tracking-widest text-white/50 hover:text-acid">
          ← {modulo.title}
        </Link>
        <h1 className="mb-5 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">{aula.title}</h1>

        <div className="aspect-video w-full overflow-hidden border border-white/10 bg-black">
          {url ? (
            esArchivo ? (
              <video src={url} controls controlsList="nodownload" className="h-full w-full" />
            ) : (
              <iframe src={url} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              El video de esta clase todavía no está disponible.
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <form action={toggleCompletada.bind(null, id, hecha)}>
            <button
              className={`border-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition ${
                hecha ? "border-acid bg-acid text-black" : "border-white/40 hover:border-acid hover:text-acid"
              }`}
            >
              {hecha ? "✓ Completada" : "Marcar como completada"}
            </button>
          </form>
          {anterior && (
            <Link href={`/aulas/${anterior.id}`} className="px-3 py-3 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white">
              ← Anterior
            </Link>
          )}
          {siguiente && (
            <Link href={`/aulas/${siguiente.id}`} className="px-3 py-3 text-xs font-bold uppercase tracking-widest text-acid">
              Siguiente →
            </Link>
          )}
        </div>

        {aula.description && <p className="mt-6 max-w-2xl leading-relaxed text-white/70">{aula.description}</p>}
      </div>

      <aside className="border border-white/10 bg-[#141414]">
        <h2 className="border-b border-white/10 p-4 text-xs font-black uppercase tracking-widest">{modulo.title}</h2>
        <ul>
          {lista.map((a) => (
            <li key={a.id}>
              <Link
                href={`/aulas/${a.id}`}
                className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition hover:bg-white/5 ${
                  a.id === id ? "border-acid bg-white/5 text-acid" : "border-transparent text-white/70"
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${completadas.has(a.id) ? "border-acid bg-acid text-black" : "border-white/30"}`}>
                  {completadas.has(a.id) ? "✓" : ""}
                </span>
                <span className="flex-1">{a.title}</span>
                {a.duration_minutes && <span className="text-xs text-white/30">{a.duration_minutes}′</span>}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
