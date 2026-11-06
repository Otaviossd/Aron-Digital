import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hace } from "@/lib/comentarios";
import { Pildora, Titulo } from "@/components/admin/ui";
import { ui } from "@/lib/ui";
import { borrarComentarioAdmin, responderComentario } from "./actions";

export default function AdminComentariosPage(props: PageProps<"/admin/comentarios">) {
  return (
    <>
      <Titulo titulo="Comentarios y comunidad" sub="Preguntas de los alumnos en las clases y publicaciones de la comunidad. Respondé desde acá: tu respuesta sale con el sello de Instructor." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/[0.03]" />}>
        <Lista searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

type Fila = {
  id: string;
  tipo: "aula" | "comunidad";
  lesson_id: string | null;
  parent_id: string | null;
  autor_email: string;
  autor_nombre: string;
  cuerpo: string;
  created_at: string;
};

async function Lista({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const { ver } = await searchParams;
  const soloPendientes = ver !== "todos";
  const supabase = await createClient();

  const [{ data, error }, { data: inst }, { data: clases }] = await Promise.all([
    supabase.from("comentarios").select("id, tipo, lesson_id, parent_id, autor_email, autor_nombre, cuerpo, created_at").order("created_at", { ascending: false }).limit(300),
    supabase.from("instructores").select("email"),
    supabase.from("lessons").select("id, title"),
  ]);

  if (error) {
    return (
      <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-6 text-sm text-amber-200">
        Faltan las tablas de la plataforma v2. Ejecutá <code className="font-mono">supabase/plataforma-v2.sql</code> en el SQL Editor de Supabase.
      </p>
    );
  }

  const todos = (data ?? []) as Fila[];
  const emailsInstructor = new Set(((inst ?? []) as { email: string }[]).map((i) => i.email.toLowerCase()));
  const titulos = new Map(((clases ?? []) as { id: string; title: string }[]).map((c) => [c.id, c.title]));
  const respuestas = new Map<string, Fila[]>();
  for (const c of todos) if (c.parent_id) respuestas.set(c.parent_id, [...(respuestas.get(c.parent_id) ?? []), c]);

  const principales = todos.filter((c) => !c.parent_id);
  const sinResponder = (c: Fila) => !emailsInstructor.has(c.autor_email.toLowerCase()) && !(respuestas.get(c.id) ?? []).some((r) => emailsInstructor.has(r.autor_email.toLowerCase()));
  const mostrar = soloPendientes ? principales.filter(sinResponder) : principales;
  const pendientes = principales.filter(sinResponder).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link href="/admin/comentarios" className={`rounded-full px-4 py-2 text-sm transition ${soloPendientes ? "bg-accent/15 font-medium text-accent" : "text-muted hover:text-ink"}`}>
          Sin responder ({pendientes})
        </Link>
        <Link href="/admin/comentarios?ver=todos" className={`rounded-full px-4 py-2 text-sm transition ${!soloPendientes ? "bg-accent/15 font-medium text-accent" : "text-muted hover:text-ink"}`}>
          Todos ({principales.length})
        </Link>
      </div>

      {mostrar.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-5 py-14 text-center text-sm text-faint">
          {soloPendientes ? "No hay preguntas pendientes. ¡Todo respondido!" : "Todavía no hay comentarios."}
        </p>
      ) : (
        <ul className="space-y-4">
          {mostrar.map((c) => (
            <li key={c.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {c.tipo === "aula" ? (
                  <Link href={`/aulas/${c.lesson_id}?tab=comentarios`} className="font-medium text-accent hover:underline">
                    {titulos.get(c.lesson_id ?? "") ?? "Clase"}
                  </Link>
                ) : (
                  <Link href="/aulas/comunidad" className="font-medium text-accent hover:underline">
                    Comunidad
                  </Link>
                )}
                <span className="text-faint">· {hace(c.created_at)}</span>
                {sinResponder(c) ? <Pildora tono="aviso">Sin responder</Pildora> : <Pildora tono="ok">Respondido</Pildora>}
              </div>
              <p className="mt-3 text-sm font-semibold">
                {c.autor_nombre} <span className="font-normal text-faint">· {c.autor_email}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/90">{c.cuerpo}</p>

              {(respuestas.get(c.id) ?? [])
                .slice()
                .sort((a, b) => a.created_at.localeCompare(b.created_at))
                .map((r) => (
                  <div key={r.id} className="mt-3 border-l border-line pl-4 text-sm">
                    <p className="text-xs font-semibold">
                      {r.autor_nombre}
                      {emailsInstructor.has(r.autor_email.toLowerCase()) && <span className="ml-2 rounded-full bg-accent/15 px-2 py-px text-[10px] text-accent">Instructor</span>}
                      <span className="ml-2 font-normal text-faint">{hace(r.created_at)}</span>
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-ink/80">{r.cuerpo}</p>
                  </div>
                ))}

              <form action={responderComentario} className="mt-4 flex gap-2">
                <input type="hidden" name="tipo" value={c.tipo} />
                <input type="hidden" name="lesson_id" value={c.lesson_id ?? ""} />
                <input type="hidden" name="parent_id" value={c.id} />
                <input name="cuerpo" required maxLength={2000} placeholder="Escribí tu respuesta…" aria-label="Respuesta" className={ui.campo} />
                <button className={`${ui.botonChico} shrink-0 px-5`}>Responder</button>
                <button formAction={borrarComentarioAdmin} formNoValidate name="id" value={c.id} className="shrink-0 px-2 text-xs text-faint transition hover:text-red-300" aria-label="Eliminar comentario">
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
