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
      <h1 className="mb-6 text-3xl font-black uppercase tracking-tight">
        {q ? <>Resultados para “<span className="text-acid">{q}</span>”</> : "Buscar"}
      </h1>

      {!q && <p className="text-white/50">Escribí algo en el buscador de arriba.</p>}
      {q && modulosOk.length === 0 && aulasOk.length === 0 && (
        <p className="text-white/50">No encontramos nada. Probá con otra palabra.</p>
      )}

      {modulosOk.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">Módulos</h2>
          <ul className="divide-y divide-white/10 border border-white/10 bg-[#141414]">
            {modulosOk.map((m) => (
              <li key={m.id}>
                <Link href={`/aulas/modulo/${m.id}`} className="block px-5 py-4 font-semibold hover:bg-white/5 hover:text-acid">
                  {m.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {aulasOk.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">Clases</h2>
          <ul className="divide-y divide-white/10 border border-white/10 bg-[#141414]">
            {aulasOk.map((a) => (
              <li key={a.id}>
                <Link href={`/aulas/${a.id}`} className="block px-5 py-4 hover:bg-white/5 hover:text-acid">
                  <span className="font-semibold">{a.title}</span>
                  <span className="block text-xs text-white/40">{modulos.find((m) => m.id === a.module_id)?.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
