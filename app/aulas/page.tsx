import { Suspense } from "react";
import Link from "next/link";
import CoverCard from "@/components/members/CoverCard";
import Row from "@/components/members/Row";
import { aulasDelModulo, getMemberData, siguienteAula } from "@/lib/members";
import { FOTOS, fondoFoto } from "@/lib/fotos";
import { ui } from "@/lib/ui";

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
        <h1 className="mb-4 text-3xl font-semibold tracking-tight">No encontramos tu acceso</h1>
        <p className="mb-7 leading-relaxed text-muted">
          Entraste con <span className="text-ink">{email}</span>, pero no hay una compra activa con ese email. Si
          compraste con otro email, cerrá sesión y entrá con ese.
        </p>
        <Link href="/ventas#comprar" className={ui.boton}>
          Comprar acceso
        </Link>
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
      <section
        className="relative mb-14 overflow-hidden rounded-3xl border border-line p-8 sm:p-12"
        style={fondoFoto(FOTOS.aulas, "linear-gradient(90deg, rgba(10,10,10,.95) 0%, rgba(10,10,10,.7) 60%, rgba(10,10,10,.35) 100%)")}
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        {siguiente ? (
          <div className="relative">
            <p className="mb-4 text-sm font-medium text-accent">
              {completadas.size === 0 ? "Empezá acá" : "Seguí donde quedaste"}
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {siguiente.aula.title}
            </h1>
            <p className="mt-3 text-sm text-muted">{siguiente.modulo.title}</p>
            <Link href={`/aulas/${siguiente.aula.id}`} className={`${ui.boton} mt-8`}>
              {completadas.size === 0 ? "Ver primera clase" : "Continuar"}
            </Link>
          </div>
        ) : (
          <div className="relative">
            <p className="mb-4 text-sm font-medium text-accent">Al día</p>
            <h1 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Completaste todo lo disponible
            </h1>
            <p className="mt-3 text-sm text-muted">Volvé pronto: se publican clases nuevas cada semana.</p>
          </div>
        )}
      </section>

      {enProgreso.length > 0 && (
        <Row titulo="Seguí con estos módulos" subtitulo="Los que ya empezaste">
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
