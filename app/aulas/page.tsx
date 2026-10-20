import { Suspense } from "react";
import Link from "next/link";
import CoverCard from "@/components/members/CoverCard";
import Row from "@/components/members/Row";
import { aulasDelModulo, diasRestantes, getMemberData, siguienteAula } from "@/lib/members";
import { FOTOS } from "@/lib/fotos";
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

  const datos = modulos.map((m, idx) => {
    const lista = aulasDelModulo(aulas, m.id).filter((x) => x.is_unlocked !== false);
    const hechas = lista.filter((x) => completadas.has(x.id)).length;
    return {
      m,
      numero: m.is_bonus ? 0 : modulos.filter((x, i) => !x.is_bonus && i <= idx).length,
      total: lista.length,
      progreso: lista.length === 0 ? 0 : Math.round((hechas / lista.length) * 100),
    };
  });

  const principales = datos.filter((d) => !d.m.is_bonus);
  const bonos = datos.filter((d) => d.m.is_bonus);
  const enProgreso = principales.filter((d) => d.m.is_unlocked && d.progreso > 0 && d.progreso < 100);
  const siguiente = siguienteAula(modulos, aulas, completadas);
  const proximoBono = bonos.find((d) => !d.m.is_unlocked && d.m.unlock_at);

  return (
    <>
      {/* Portada */}
      <section
        className="relative mb-14 min-h-[22rem] overflow-hidden rounded-3xl border border-line sm:min-h-[26rem]"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(10,10,10,.96) 0%, rgba(10,10,10,.78) 45%, rgba(10,10,10,.15) 100%), linear-gradient(0deg, rgba(10,10,10,.85) 0%, transparent 45%), url(${FOTOS.aulas})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      >
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
        <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-8 sm:min-h-[26rem] sm:p-12">
          {siguiente ? (
            <>
              <p className="mb-4 text-sm font-medium text-accent">{completadas.size === 0 ? "Empezá acá" : "Seguí donde quedaste"}</p>
              <h1 className="max-w-2xl text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">{siguiente.aula.title}</h1>
              <p className="mt-3 text-sm text-muted">{siguiente.modulo.title}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/aulas/${siguiente.aula.id}`} className={ui.boton}>
                  {completadas.size === 0 ? "Ver primera clase" : "Continuar"}
                </Link>
                {proximoBono?.m.unlock_at && (
                  <span className="rounded-full border border-line-strong bg-black/30 px-4 py-2.5 text-xs text-muted backdrop-blur">
                    {proximoBono.m.title} se libera {diasRestantes(proximoBono.m.unlock_at)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm font-medium text-accent">Al día</p>
              <h1 className="max-w-2xl text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">Completaste todo lo disponible</h1>
              <p className="mt-3 text-sm text-muted">Volvé pronto: se publican clases nuevas cada semana.</p>
            </>
          )}
        </div>
      </section>

      {enProgreso.length > 0 && (
        <Row titulo="Seguí con estos módulos" subtitulo="Los que ya empezaste">
          {enProgreso.map((d) => (
            <CoverCard key={d.m.id} modulo={d.m} numero={d.numero} progreso={d.progreso} totalAulas={d.total} />
          ))}
        </Row>
      )}

      <Row titulo="Todos los módulos" subtitulo="Los módulos con candado se liberan solos con el tiempo">
        {principales.map((d) => (
          <CoverCard key={d.m.id} modulo={d.m} numero={d.numero} progreso={d.progreso} totalAulas={d.total} />
        ))}
      </Row>

      {bonos.length > 0 && (
        <Row titulo="Bonos" subtitulo="Regalos de lanzamiento: se abren a los 7 días de tu acceso">
          {bonos.map((d, i) => (
            <CoverCard key={d.m.id} modulo={d.m} numero={i + 1} progreso={d.progreso} totalAulas={d.total} />
          ))}
        </Row>
      )}
    </>
  );
}
