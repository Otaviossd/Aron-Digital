import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aulasDelModulo, getMemberData } from "@/lib/members";

export default function ModuloPage(props: PageProps<"/aulas/modulo/[id]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <ModuloContenido params={props.params} />
    </Suspense>
  );
}

async function ModuloContenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { modulos, aulas, completadas } = await getMemberData();

  const indice = modulos.findIndex((m) => m.id === id);
  const modulo = modulos[indice];
  // Módulo inexistente o todavía bloqueado: no se muestra su contenido.
  if (!modulo || !modulo.is_unlocked) notFound();

  const lista = aulasDelModulo(aulas, id);
  const hechas = lista.filter((a) => completadas.has(a.id)).length;
  const progreso = lista.length === 0 ? 0 : Math.round((hechas / lista.length) * 100);
  const accent = /^#[0-9a-fA-F]{6}$/.test(modulo.accent) ? modulo.accent : "#cdb48a";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/aulas" className="mb-6 inline-block text-sm text-muted transition hover:text-ink">
        ← Todos los módulos
      </Link>

      <header
        className="relative mb-8 overflow-hidden rounded-3xl border border-line p-8 sm:p-10"
        style={{ background: `radial-gradient(90% 120% at 0% 0%, ${accent}2e, transparent 60%), #111112` }}
      >
        <p className="mb-3 text-sm font-medium text-accent">Módulo {indice + 1}</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{modulo.title}</h1>
        {modulo.description && <p className="mt-3 max-w-xl leading-relaxed text-muted">{modulo.description}</p>}
        <div className="mt-7 flex items-center gap-3 text-xs text-muted">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progreso}%` }} />
          </div>
          {hechas} de {lista.length} completadas
        </div>
      </header>

      {lista.length === 0 ? (
        <p className="text-muted">Las clases de este módulo se publican semana a semana.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {lista.map((a, i) => (
            <li key={a.id}>
              <Link href={`/aulas/${a.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
                    completadas.has(a.id) ? "border-accent bg-accent font-semibold text-bg" : "border-line-strong text-muted"
                  }`}
                >
                  {completadas.has(a.id) ? "✓" : i + 1}
                </span>
                <span className="flex-1 text-[15px] font-medium">{a.title}</span>
                {a.duration_minutes && <span className="text-xs text-faint">{a.duration_minutes} min</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
