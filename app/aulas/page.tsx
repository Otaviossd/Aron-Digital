import { Suspense } from "react";
import Link from "next/link";
import CoverCard from "@/components/members/CoverCard";
import Row from "@/components/members/Row";
import { aulasDelModulo, getMemberData, siguienteAula } from "@/lib/members";

export default function AulasPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Inicio />
    </Suspense>
  );
}

async function Inicio() {
  const { modulos, aulas, completadas, email } = await getMemberData();

  // Sem compra vigente para este e-mail
  if (modulos.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16">
        <h1 className="mb-4 text-4xl font-black uppercase leading-none">
          No encontramos <span className="text-acid">tu acceso</span>
        </h1>
        <p className="mb-6 text-white/70">
          Entraste con <strong>{email}</strong>, pero no hay una compra activa con ese email. Si
          compraste con otro email, cerrá sesión y entrá con ese.
        </p>
        <a href="/#comprar" className="inline-block border-2 border-acid bg-acid px-5 py-3 text-xs font-black uppercase tracking-widest text-black">
          Comprar acceso
        </a>
      </div>
    );
  }

  const datos = modulos.map((m, i) => {
    const lista = aulasDelModulo(aulas, m.id);
    const hechas = lista.filter((a) => completadas.has(a.id)).length;
    return {
      m,
      numero: i + 1,
      total: lista.length,
      progreso: lista.length === 0 ? 0 : Math.round((hechas / lista.length) * 100),
    };
  });

  const enProgreso = datos.filter((d) => d.m.is_unlocked && d.progreso > 0 && d.progreso < 100);
  const siguiente = siguienteAula(modulos, aulas, completadas);

  return (
    <>
      {/* Siguiente clase */}
      <section className="relative mb-10 overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black p-6 sm:p-10">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-acid/10 blur-3xl" />
        {siguiente ? (
          <>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-acid">
              {completadas.size === 0 ? "Empezá acá" : "Seguí donde quedaste"}
            </p>
            <h1 className="max-w-2xl text-3xl font-black uppercase leading-[1.0] tracking-tight sm:text-5xl">
              {siguiente.aula.title}
            </h1>
            <p className="mt-3 text-sm text-white/50">{siguiente.modulo.title}</p>
            <Link
              href={`/aulas/${siguiente.aula.id}`}
              className="mt-7 inline-block border-2 border-acid bg-acid px-7 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-transparent hover:text-acid"
            >
              {completadas.size === 0 ? "Ver primera clase" : "Continuar"}
            </Link>
          </>
        ) : (
          <>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-acid">Al día</p>
            <h1 className="max-w-2xl text-3xl font-black uppercase leading-[1.0] tracking-tight sm:text-5xl">
              Completaste todo lo disponible
            </h1>
            <p className="mt-3 text-sm text-white/50">Volvé pronto: se publican clases nuevas cada semana.</p>
          </>
        )}
      </section>

      {enProgreso.length > 0 && (
        <Row titulo="Mis módulos en progreso" subtitulo="Seguí por donde ibas">
          {enProgreso.map((d) => (
            <CoverCard key={d.m.id} modulo={d.m} numero={d.numero} progreso={d.progreso} totalAulas={d.total} />
          ))}
        </Row>
      )}

      <Row titulo="Todos los módulos" subtitulo="Los módulos con candado se liberan solos con el tiempo">
        {datos.map((d) => (
          <CoverCard key={d.m.id} modulo={d.m} numero={d.numero} progreso={d.progreso} totalAulas={d.total} />
        ))}
      </Row>
    </>
  );
}
