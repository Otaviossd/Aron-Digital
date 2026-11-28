import { Suspense } from "react";
import Link from "next/link";
import CoverCard from "@/components/members/CoverCard";
import Row from "@/components/members/Row";
import Portada from "@/components/members/Portada";
import { aulasDelModulo, diasRestantes, getMemberData, siguienteAula } from "@/lib/members";
import { ui } from "@/lib/ui";
import { EXTRA } from "@/lib/config";
import { precioExtra } from "@/lib/extra";
import Atajos from "@/components/members/Atajos";
import UpgradeTrial from "@/components/members/UpgradeTrial";

export default function AulasPage() {
  return (
    <Suspense fallback={<div className="esqueleto h-96" />}>
      <Inicio />
    </Suspense>
  );
}

async function Inicio() {
  const { modulos, aulas, completadas, email, porcentaje, supabase, esTrial, trialCompradoEn } = await getMemberData();
  const [{ data: estadoExtra }, { data: comprasExtra }] = await Promise.all([
    supabase.rpc("estado_extra"),
    supabase.from("subscriptions").select("purchased_at").is("refunded_at", null).order("purchased_at", { ascending: true }).limit(1),
  ]);
  const extraLiberaEn = typeof estadoExtra?.libera_en === "string" && estadoExtra?.liberado !== true ? estadoExtra.libera_en : null;
  const extraCompraEn = comprasExtra?.[0]?.purchased_at ? new Date(comprasExtra[0].purchased_at) : null;
  const precioModuloExtra = precioExtra(extraCompraEn, new Date());

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
      numero: m.is_bonus || m.is_live ? 0 : modulos.filter((x, i) => !x.is_bonus && !x.is_live && i <= idx).length,
      total: lista.length,
      progreso: lista.length === 0 ? 0 : Math.round((hechas / lista.length) * 100),
    };
  });

  const principales = datos.filter((d) => !d.m.is_bonus && !d.m.is_live);
  const bonos = datos.filter((d) => d.m.is_bonus);
  const grabaciones = datos.filter((d) => d.m.is_live && d.total > 0);
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

      {esTrial && email && <UpgradeTrial email={email} compradoEn={trialCompradoEn} />}

      <Atajos porcentaje={porcentaje} />

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

      {grabaciones.length > 0 && (
        <Row titulo="Clases en vivo grabadas" subtitulo="Cada live de Aaron queda acá completa, para verla cuando quieras">
          {grabaciones.map((d) => (
            <CoverCard key={d.m.id} modulo={d.m} numero={1} progreso={d.progreso} totalAulas={d.total} />
          ))}
        </Row>
      )}

      {bonos.length > 0 && (
        <Row titulo="Bonos" subtitulo="Regalos de lanzamiento: se abren a los 7 días de tu acceso">
          {bonos.map((d, i) => (
            <CoverCard key={d.m.id} modulo={d.m} numero={i + 1} progreso={d.progreso} totalAulas={d.total} />
          ))}
        </Row>
      )}

      <Link
        href="/aulas/extra"
        className="group relative mt-10 block overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/[0.09] via-surface to-surface p-6 transition hover:border-accent/50 sm:p-7"
      >
        <div aria-hidden="true" className="respirar absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/25 blur-[90px]" />
        <div aria-hidden="true" className="respirar absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-cyan-400/15 blur-[90px] [animation-delay:-4s]" />

        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div aria-hidden="true" className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/60 to-cyan-400/40 opacity-60 blur-md transition group-hover:opacity-90" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EXTRA.portadaChica}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              className="relative h-20 w-20 rounded-2xl border border-accent/40 object-cover shadow-[0_10px_30px_-8px_rgba(57,255,126,.6)] transition duration-500 group-hover:scale-105 sm:h-24 sm:w-24"
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              Bono extra
            </span>
            <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{EXTRA.titulo}</h3>
            <p className="mt-1 max-w-md truncate text-sm text-muted sm:whitespace-normal">{EXTRA.descripcion}</p>
            {extraLiberaEn ? (
              <p className="mt-2 text-xs font-medium text-ink/70">Se libera {diasRestantes(extraLiberaEn)}</p>
            ) : (
              <p className="mt-3 flex items-baseline gap-2">
                {precioModuloExtra.enOferta && <span className="text-sm text-faint line-through">US${precioModuloExtra.valorAntes}</span>}
                <span className="text-xl font-bold tracking-tight text-accent">US${precioModuloExtra.valor}</span>
              </p>
            )}
          </div>

          <span className={`${ui.boton} shrink-0 self-stretch px-6 sm:self-center`}>Ver el bono →</span>
        </div>
      </Link>
    </>
  );
}
