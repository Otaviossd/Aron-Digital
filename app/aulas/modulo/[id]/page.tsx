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
  const accent = /^#[0-9a-fA-F]{6}$/.test(modulo.accent) ? modulo.accent : "#d4ff00";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/aulas" className="mb-5 inline-block text-xs uppercase tracking-widest text-white/50 hover:text-acid">
        ← Todos los módulos
      </Link>

      <header className="relative mb-8 overflow-hidden border border-white/10 p-6 sm:p-8" style={{ background: `linear-gradient(135deg, ${accent}22, #000 60%)` }}>
        <span className="mb-3 inline-block px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black" style={{ background: accent }}>
          Módulo {indice + 1}
        </span>
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">{modulo.title}</h1>
        {modulo.description && <p className="mt-3 max-w-xl text-white/60">{modulo.description}</p>}
        <div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/50">
          <div className="h-1.5 w-40 bg-white/15">
            <div className="h-full" style={{ width: `${progreso}%`, background: accent }} />
          </div>
          {hechas}/{lista.length} completadas
        </div>
      </header>

      {lista.length === 0 ? (
        <p className="text-white/50">Las clases de este módulo se publican semana a semana.</p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10 bg-[#141414]">
          {lista.map((a, i) => (
            <li key={a.id}>
              <Link href={`/aulas/${a.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${completadas.has(a.id) ? "border-acid bg-acid text-black" : "border-white/30 text-white/60"}`}>
                  {completadas.has(a.id) ? "✓" : i + 1}
                </span>
                <span className="flex-1 font-semibold">{a.title}</span>
                {a.duration_minutes && <span className="text-xs text-white/40">{a.duration_minutes} min</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
