import { Suspense } from "react";
import Link from "next/link";
import { getMemberData } from "@/lib/members";

export default function BuscarPage(props: PageProps<"/aulas/buscar">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Resultados searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Resultados({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const { modulos, aulas } = await getMemberData();

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const nq = norm(q);

  // Solo se busca entre lo que RLS ya dejó ver (módulos liberados y clases publicadas)
  const modulosOk = nq
    ? modulos.filter((m) => m.is_unlocked && norm(`${m.title} ${m.description ?? ""}`).includes(nq))
    : [];
  const aulasOk = nq ? aulas.filter((a) => norm(`${a.title} ${a.description ?? ""}`).includes(nq)) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        {q ? <>Resultados para “{q}”</> : "Buscar"}
      </h1>

      {!q && <p className="text-muted">Escribí algo en el buscador de arriba.</p>}
      {q && modulosOk.length === 0 && aulasOk.length === 0 && (
        <p className="text-muted">No encontramos nada. Probá con otra palabra.</p>
      )}

      {modulosOk.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-muted">Módulos</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {modulosOk.map((m) => (
              <li key={m.id}>
                <Link href={`/aulas/modulo/${m.id}`} className="block px-5 py-4 text-[15px] font-medium transition hover:bg-white/[0.03]">
                  {m.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {aulasOk.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Clases</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {aulasOk.map((a) => (
              <li key={a.id}>
                <Link href={`/aulas/${a.id}`} className="block px-5 py-4 transition hover:bg-white/[0.03]">
                  <span className="text-[15px] font-medium">{a.title}</span>
                  <span className="block text-xs text-faint">{modulos.find((m) => m.id === a.module_id)?.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
