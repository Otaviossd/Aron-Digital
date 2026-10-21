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
      <section className="relative mb-14 overflow-hidden rounded-3xl border border-white/10 bg-surface">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-[position:75%_center]"
          style={{ backgroundImage: `url(${FOTOS.portada})` }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#07090a] via-[#07090a]/55 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#07090a]/70 via-transparent to-transparent md:via-transparent" />
        <div className="relative flex min-h-[26rem] max-w-xl flex-col justify-end p-6 pt-48 sm:p-10 md:aspect-[16/8] md:min-h-0">
          {siguiente ? (
            <>
              <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-accent backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(57,255,126,.9)]" />
                {completadas.size === 0 ? "Empezá acá" : "Seguí donde quedaste"}
              </p>
              <h1 className="text-2xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">{siguiente.aula.title}</h1>
              <p className="mt-2 text-sm text-muted">{siguiente.modulo.title}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/aulas/${siguiente.aula.id}`} className={ui.boton}>
                  {completadas.size === 0 ? "Ver primera clase" : "Continuar"}
                </Link>
                {proximoBono?.m.unlock_at && (
                  <span className="cristal rounded-full px-4 py-2.5 text-xs text-muted">
                    {proximoBono.m.title} se libera {diasRestantes(proximoBono.m.unlock_at)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm font-medium text-accent">Al día</p>
              <h1 className="text-2xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">Completaste todo lo disponible</h1>
              <p className="mt-2 text-sm text-muted">Volvé pronto: se publican clases nuevas cada semana.</p>
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
