import { Suspense } from "react";
import Link from "next/link";
import CoverCard from "@/components/members/CoverCard";
import Row from "@/components/members/Row";
import Portada from "@/components/members/Portada";
import { aulasDelModulo, diasRestantes, getMemberData, siguienteAula } from "@/lib/members";
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
      <Portada
        titulo={siguiente?.aula.title}
        modulo={siguiente?.modulo.title}
        href={siguiente ? `/aulas/${siguiente.aula.id}` : undefined}
        empezando={completadas.size === 0}
        aviso={proximoBono?.m.unlock_at ? `${proximoBono.m.title} se libera ${diasRestantes(proximoBono.m.unlock_at)}` : undefined}
      />

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
