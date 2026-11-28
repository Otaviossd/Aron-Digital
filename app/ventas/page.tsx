import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import OfertaTrial from "@/components/OfertaTrial";
import Rastreo from "@/components/Rastreo";
import Aparece from "@/components/Aparece";
import BarraMovil from "@/components/BarraMovil";
import VideoHero from "@/components/ventas/VideoHero";
import Recorrido, { type Escena } from "@/components/ventas/Recorrido";
import { BRAND, DIAS_UPGRADE_TRIAL, PRECOS } from "@/lib/config";
import { FOTOS } from "@/lib/fotos";
import { ui } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Accedé al curso por US$1 | Aaron Dalla Rosa",
  description: "Experimentá el curso de barbería de Aaron Dalla Rosa por US$1 y mirá la plataforma por dentro, antes de ir por el acceso completo.",
};

// Funil de entrada directo: $1 para entrar y ver el Módulo 1 completo + 2 clases del Módulo 2.
// Página corta a propósito — el objetivo es que la persona entre y vea la plataforma por dentro,
// no venderle todo el curso acá (eso lo hace el banner de upgrade una vez que ya está adentro).

const CINTA = ["Acceso inmediato", "Probá el curso por dentro", "Desde el celular", "Sin mensualidades", "Pasá al curso completo cuando quieras"];

const ESCENAS: Escena[] = [
  { id: "inicio", titulo: "Tu inicio", texto: "Entrás y ves tu progreso, las clases en vivo, la comunidad y tu certificado, a un toque." },
  { id: "modulos", titulo: "Módulos y bonos", texto: "Así se ve el curso ordenado por módulos — con el Módulo 1 y el arranque del Módulo 2 ya abiertos para vos.", dimsD: [1800, 1265] },
  { id: "clase", titulo: "La clase", texto: "El video, la lista de clases del módulo y los comentarios para dejar tus dudas." },
];

const INCLUYE = [
  { t: "Entrás a la plataforma", d: "Mirás el curso por tu cuenta, desde adentro, antes de decidir si vas por el acceso completo." },
  { t: "Ves el método de Aaron", d: "Clases reales, paso a paso, tal como las ve cualquier alumno del curso." },
  { t: "Acceso inmediato", d: "Pagás y te llega el acceso por email al instante. Entrás desde el celular, la tablet o la computadora." },
];

const PREGUNTAS = [
  { q: "¿Qué veo exactamente por US$1?", r: "El Módulo 1 completo (fundamentos de la barbería) y las primeras 2 clases del Módulo 2. El resto del curso queda bloqueado hasta que decidas pasar al acceso completo." },
  { q: "¿Cuándo recibo el acceso?", r: "Apenas se confirma el pago te llega un email con un botón para entrar. Entrás con ese mismo email." },
  { q: "¿Y si quiero el curso completo?", r: `Tenés ${DIAS_UPGRADE_TRIAL} días desde que entrás para pasar al acceso vitalicio completo al precio de lanzamiento, con todos los bonos. Lo ves directo desde adentro de la plataforma.` },
  { q: "¿Es un pago único?", r: "Sí. No hay mensualidades ni renovaciones automáticas." },
];

export default function VentasPage() {
  return (
    <main className="touch-pan-y overflow-x-clip">
      <Rastreo path="/ventas" />

      {/* Barra de precio, fija arriba de todo */}
      <a
        href="#comprar"
        className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-accent px-4 py-2.5 text-center text-sm font-bold tracking-tight text-black transition hover:brightness-95"
      >
        <span className="hidden sm:inline">⚡ Oferta de entrada:</span> Accedé al curso por solo US${PRECOS.trial.valor} →
      </a>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="rejilla absolute inset-0" />
          <div className="respirar absolute -right-24 top-0 h-[38rem] w-[38rem] rounded-full bg-accent/30 blur-[140px]" />
          <div className="respirar absolute -left-40 top-[28rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[130px] [animation-delay:-3s]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
        </div>

        <nav className="hero-in mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-lno.png" alt="" width={36} height={36} className="h-9 w-9 rounded-[11px]" />
            <span className="text-sm font-semibold tracking-tight">La Nueva Ola Academy</span>
          </span>
          <Link href="/entrar" className="text-sm text-muted transition hover:text-ink">
            Ya soy alumno
          </Link>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-10">
          <div className="hero-in cristal relative overflow-hidden rounded-3xl p-7 sm:p-10" style={{ ["--d" as string]: "80ms" }}>
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="hero-in mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent" style={{ ["--d" as string]: "200ms" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Probalo vos mismo · solo US${PRECOS.trial.valor}
            </p>
            <h1 className="hero-in text-[clamp(2.1rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.03em]" style={{ ["--d" as string]: "280ms" }}>
              Experimentá el curso <span className="texto-luz">por US${PRECOS.trial.valor}.</span>
            </h1>
            <p className="hero-in mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg" style={{ ["--d" as string]: "380ms" }}>
              Entrá ya a la plataforma del curso de Aaron Dalla Rosa, barbero educador internacional, y mirá por tu cuenta cómo enseña — por dentro, con tu propio acceso.
            </p>
            <div className="hero-in mt-8 flex flex-wrap items-center gap-4" style={{ ["--d" as string]: "480ms" }}>
              <a href="#comprar" className={`${ui.boton} w-full sm:w-auto sm:px-8 sm:py-3.5`}>
                Experimentar por US${PRECOS.trial.valor}
              </a>
              <a href="#por-dentro" className="px-2 py-3 text-sm font-medium text-muted transition hover:text-ink">
                Ver el curso por dentro ↓
              </a>
            </div>
            <ul className="hero-in mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-sm text-muted" style={{ ["--d" as string]: "580ms" }}>
              {["Acceso inmediato", "Sin mensualidades", "Pasá al curso completo cuando quieras"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div aria-hidden="true" className="respirar absolute left-1/2 top-[42%] h-[34rem] w-[34rem] max-w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(57,255,126,.5),rgba(57,255,126,.2)_45%,rgba(57,255,126,.06)_72%,transparent)]" />
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute left-1/2 top-[40%] hidden h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 overflow-visible sm:block">
              <circle cx="50" cy="50" r="49.6" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="0.25" />
              <circle cx="50" cy="50" r="49.6" fill="none" stroke="#39ff7e" strokeWidth="0.5" strokeLinecap="round" strokeDasharray="34 278" className="anillo-giro" />
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOTOS.retratoRecorte}
              alt="Aaron Dalla Rosa"
              width={900}
              height={1500}
              fetchPriority="high"
              className="hero-foto foto-fundida relative z-10 mx-auto h-auto max-h-[42rem] w-auto max-w-full object-contain"
            />
            <VideoHero url={process.env.NEXT_PUBLIC_VIDEO_VENTAS} />
            {/* Etiqueta de precio, bien grande y clavada sobre la foto */}
            <a
              href="#comprar"
              className="hero-in absolute -right-1 top-6 z-20 flex -rotate-6 flex-col items-center rounded-2xl border-2 border-black/20 bg-accent px-5 py-3 text-black shadow-[0_18px_45px_-10px_rgba(57,255,126,.75)] transition hover:rotate-0 sm:right-4"
              style={{ ["--d" as string]: "160ms" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">Entrá por</span>
              <span className="text-4xl font-black leading-none tracking-tight sm:text-5xl">US${PRECOS.trial.valor}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Cinta */}
      <div className="overflow-hidden border-y border-white/10 bg-white/[0.02] py-4" aria-hidden="true">
        <div className="cinta flex w-max gap-10 whitespace-nowrap">
          {[...CINTA, ...CINTA, ...CINTA, ...CINTA].map((t, i) => (
            <span key={i} className="flex items-center gap-10 text-sm font-medium text-ink/80">
              {t}
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(57,255,126,.9)]" />
            </span>
          ))}
        </div>
      </div>

      {/* El curso por dentro: capturas reales de la plataforma */}
      <section id="por-dentro" className="relative mx-auto max-w-6xl scroll-mt-8 px-6 pt-24">
        <Aparece>
          <p className="mb-3 text-sm font-medium text-accent">El curso por dentro</p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Así se ve la plataforma, <span className="texto-luz">desde tu lugar de alumno.</span>
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">Son pantallas reales del curso, en la computadora y en el celular. Tocá cada una para verla.</p>
        </Aparece>
        <Aparece className="mt-12">
          <Recorrido escenas={ESCENAS} />
        </Aparece>
      </section>

      {/* Qué incluye el US$1 */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Aparece>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Qué te llevás por US${PRECOS.trial.valor}</h2>
        </Aparece>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {INCLUYE.map((i, n) => (
            <Aparece key={i.t} retraso={n * 70}>
              <div className="h-full rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/[0.08] to-transparent p-6">
                <p className="mb-5 text-4xl font-semibold tracking-tight text-accent/90">0{n + 1}</p>
                <h3 className="text-lg font-medium tracking-tight">{i.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{i.d}</p>
              </div>
            </Aparece>
          ))}
        </div>
      </section>

      {/* Oferta */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-top opacity-25"
            style={{ backgroundImage: `linear-gradient(0deg, #07090a 5%, transparent 60%, #07090a 100%), url(${FOTOS.auditorio})` }}
          />
          <div className="respirar absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-xl px-6 py-24">
          <Aparece>
            <h2 className="mb-3 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Entrá hoy por <span className="texto-luz">US${PRECOS.trial.valor}.</span>
            </h2>
            <p className="mb-10 text-center text-sm text-muted">Sin vueltas: pagás US${PRECOS.trial.valor} y entrás ya a probar el curso por tu cuenta.</p>
          </Aparece>
          <Suspense fallback={<div className="cristal h-96 rounded-3xl" />}>
            <OfertaTrial />
          </Suspense>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-8">
        <Aparece>
          <h2 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
        </Aparece>
        <div className="space-y-3">
          {PREGUNTAS.map((p) => (
            <details key={p.q} className="cristal group rounded-2xl px-5 py-4 open:border-accent/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                {p.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-accent transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <Aparece>
          <div className="cristal relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
            <div aria-hidden="true" className="respirar absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[100px]" />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Mirá el curso por dentro, <span className="texto-luz">hoy mismo.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-muted">Experimentá el curso por US${PRECOS.trial.valor}. Acceso inmediato por email.</p>
            <a href="#comprar" className={`${ui.boton} relative mt-8 px-8 py-3.5`}>
              Experimentar por US${PRECOS.trial.valor}
            </a>
          </div>
        </Aparece>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-faint">
          <span>© {BRAND}. Todos los derechos reservados.</span>
          <Link href="/entrar" className="transition hover:text-muted">
            ¿Ya sos alumno? Entrá acá
          </Link>
        </div>
      </footer>

      <BarraMovil texto={`Experimentar por US$${PRECOS.trial.valor}`} />
    </main>
  );
}
