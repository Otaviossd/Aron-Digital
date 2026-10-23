import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Oferta from "@/components/Oferta";
import Rastreo from "@/components/Rastreo";
import Aparece from "@/components/Aparece";
import BarraMovil from "@/components/BarraMovil";
import VideoVentas from "@/components/VideoVentas";
import { vagasPromoRestantes } from "@/lib/promo";
import { BRAND, DIAS_BONO, DIAS_REEMBOLSO } from "@/lib/config";
import { FOTOS } from "@/lib/fotos";
import { ui } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Curso de Barbería | Aaron Dalla Rosa",
  description:
    "Aprendé barbería de verdad con Aaron Dalla Rosa, barbero educador internacional. Clases nuevas cada semana, pago único y acceso inmediato.",
};

// Contenido editable (cambiá los textos acá, sin tocar el diseño).
const CINTA = ["Pago único", "Acceso inmediato", "Clases nuevas cada semana", "Bonos incluidos", "Desde el celular", "Reembolso de 7 días"];

const NUMEROS = [
  { n: "+2.500", t: "barberos formados" },
  { n: "6", t: "países con cursos presenciales" },
  { n: "Cada semana", t: "una clase nueva" },
  { n: "1 pago", t: "sin mensualidades" },
];

const RUTA = [
  { t: "Fundamentos", d: "Herramientas, postura y tu primer corte completo." },
  { t: "Degradê", d: "El mapa de la cabeza y el degradê paso a paso." },
  { t: "Avanzado", d: "Acabados con navaja y atención premium." },
  { t: "Barba y perfilado", d: "Diseño de barba, líneas limpias y toalla caliente." },
  { t: "Tu negocio de barbería", d: "Precios, clientes fijos y cómo vender sin bajar tu valor." },
];

const BONOS = [
  { t: "Color", d: "Teoría del color, decoloración, mechas y matizado para barberos." },
  { t: "Mindset del barbero rico", d: "Hábitos, números y mentalidad para vivir bien de la barbería." },
];

const INCLUYE = [
  { t: "Clases nuevas cada semana", d: "Un video nuevo todos los lunes. El curso crece mientras vos crecés." },
  { t: "Acceso inmediato", d: "Pagás y te llega el acceso por email en segundos. Sin esperas, sin grupos." },
  { t: "Del cero al corte", d: "Pensado para quien empieza: técnica, herramientas y paso a paso en video." },
  { t: "Desde cualquier lugar", d: "Celular, tablet o computadora. Seguís donde te quedaste." },
];

const PARA_QUIEN = [
  "Estás empezando y querés una base sólida y ordenada.",
  "Ya cortás y querés perfeccionar tu técnica y cobrar mejor.",
  "Querés aprender de alguien que enseña lo que hace todos los días.",
];

const PREGUNTAS = [
  { q: "¿Cuándo recibo el acceso?", r: "Apenas se confirma el pago te llega un email con un botón para entrar. Entrás con ese mismo email: tocás el botón del email y entrás directo." },
  { q: "¿Es un pago único?", r: "Sí. No hay mensualidades ni renovaciones automáticas. Pagás una vez." },
  { q: "¿Qué diferencia hay entre el acceso de 1 año y el vitalicio?", r: "Con el de 1 año tenés el curso por 12 meses desde tu compra. Con el vitalicio es para siempre, e incluye todas las actualizaciones y clases nuevas." },
  { q: "¿Cuándo se abren los bonos?", r: `Los bonos y algunas clases se liberan ${DIAS_BONO} días después de tu compra. Los ves en tu panel con el candado y el tiempo que falta.` },
  { q: "¿Sirve si recién empiezo?", r: "Sí. El camino va de lo básico a lo avanzado, en orden, para que no te saltees nada." },
  { q: "¿Desde dónde lo veo?", r: "Desde el celular, la tablet o la computadora, cuando quieras." },
  { q: "¿Puedo pedir reembolso?", r: `Sí, tenés ${DIAS_REEMBOLSO} días desde tu compra. Escribinos a soporte dentro de ese plazo y lo gestionamos.` },
];

const Candado = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.7 2.7L16 9.8" />
  </svg>
);

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`cristal absolute z-20 rounded-2xl px-4 py-3 text-sm ${className}`}>{children}</div>;
}

async function SeccionOferta() {
  const restantes = await vagasPromoRestantes();
  return <Oferta vagasRestantes={restantes} />;
}

export default function VentasPage() {
  return (
    <main className="overflow-x-clip">
      <Rastreo path="/ventas" />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="rejilla absolute inset-0" />
          <div className="respirar absolute -right-24 top-0 h-[38rem] w-[38rem] rounded-full bg-accent/30 blur-[140px]" />
          <div className="respirar absolute -left-40 top-[28rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[130px] [animation-delay:-3s]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
        </div>

        <nav className="mx-auto flex max-w-6xl items-center px-6 py-6">
          <span className="text-sm font-semibold tracking-tight">{BRAND}</span>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-10">
          <div className="cristal relative overflow-hidden rounded-3xl p-7 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Curso online de barbería · Inscripciones abiertas
            </p>
            <h1 className="text-[clamp(2.1rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              Aprendé barbería <span className="texto-luz">de verdad,</span> paso a paso.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Con Aaron Dalla Rosa, barbero educador internacional que ya formó a más de 2.500 barberos. Clases nuevas cada semana, directo a tu celular.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#comprar" className={`${ui.boton} w-full sm:w-auto sm:px-8 sm:py-3.5`}>
                Quiero mi lugar
              </a>
              <a href="#ruta" className="px-2 py-3 text-sm font-medium text-muted transition hover:text-ink">
                Ver qué incluye ↓
              </a>
            </div>
            <p className="mt-5 text-sm text-muted">Dejá tu email y tu WhatsApp para ver los precios y la oferta de lanzamiento.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div aria-hidden="true" className="respirar absolute left-1/2 top-[42%] h-[34rem] w-[34rem] max-w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(57,255,126,.5),rgba(57,255,126,.2)_45%,rgba(57,255,126,.06)_72%,transparent)]" />
            <div aria-hidden="true" className="absolute left-1/2 top-[40%] hidden h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:block" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOTOS.retratoRecorte}
              alt="Aaron Dalla Rosa"
              width={900}
              height={1500}
              fetchPriority="high"
              className="foto-fundida relative z-10 mx-auto h-auto max-h-[42rem] w-auto max-w-full object-contain"
            />
            <Chip className="left-0 top-[14%] flotar sm:-left-4">
              <p className="text-lg font-semibold tracking-tight text-accent">+2.500</p>
              <p className="text-xs text-muted">barberos formados</p>
            </Chip>
            <Chip className="right-0 top-[40%] flotar-lento sm:-right-4">
              <p className="text-lg font-semibold tracking-tight text-accent">6 países</p>
              <p className="text-xs text-muted">con cursos presenciales</p>
            </Chip>
            <Chip className="bottom-[12%] left-2 flotar sm:left-0">
              <p className="text-sm font-medium">Pago único</p>
              <p className="text-xs text-muted">acceso inmediato por email</p>
            </Chip>
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

      {/* Video (solo si hay NEXT_PUBLIC_VIDEO_VENTAS) */}
      <div className="pt-20 empty:hidden">
        <VideoVentas />
      </div>

      {/* Números */}
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {NUMEROS.map((x, i) => (
            <Aparece key={x.t} retraso={i * 80}>
              <div className="cristal h-full rounded-2xl p-5 text-center">
                <p className="text-2xl font-semibold tracking-tight text-accent sm:text-3xl">{x.n}</p>
                <p className="mt-1 text-xs text-muted sm:text-sm">{x.t}</p>
              </div>
            </Aparece>
          ))}
        </div>
      </section>

      {/* Ruta del curso */}
      <section id="ruta" className="relative mx-auto max-w-6xl scroll-mt-8 px-6 py-24">
        <div aria-hidden="true" className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent/10 blur-[110px]" />
        <div className="relative grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <Aparece>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Un camino claro, <span className="texto-luz">de principio a fin.</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Cada módulo se abre en su momento, para que avances en orden y sin saltearte nada. Y el contenido sigue creciendo con clases nuevas.
            </p>
          </Aparece>
          <ol className="space-y-3">
            {RUTA.map((m, i) => (
              <Aparece key={m.t} retraso={i * 70}>
                <li className="cristal group flex items-start gap-4 rounded-2xl p-5 transition duration-300 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_rgba(57,255,126,.35)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">{i + 1}</span>
                  <div>
                    <p className="text-xs font-medium text-faint">Módulo {i + 1}</p>
                    <h3 className="font-medium tracking-tight">{m.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{m.d}</p>
                  </div>
                </li>
              </Aparece>
            ))}
          </ol>
        </div>
      </section>

      {/* Bonos */}
      <section className="relative border-y border-white/10 bg-white/[0.015]">
        <div aria-hidden="true" className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <Aparece>
            <p className="mb-3 text-sm font-medium text-accent">Incluidos sin costo</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Dos <span className="texto-luz">bonos</span> de regalo
            </h2>
            <p className="mt-3 max-w-lg text-muted">Se desbloquean a los {DIAS_BONO} días de tu acceso.</p>
          </Aparece>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {BONOS.map((b, i) => (
              <Aparece key={b.t} retraso={i * 100}>
                <div className="cristal relative h-full overflow-hidden rounded-3xl p-7">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
                  <span className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    <Candado className="h-3.5 w-3.5" /> Bono · se abre a los {DIAS_BONO} días
                  </span>
                  <h3 className="relative text-2xl font-semibold tracking-tight">{b.t}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted">{b.d}</p>
                </div>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Aparece>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Todo lo que necesitás para empezar.</h2>
        </Aparece>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
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

      {/* Quién es Aaron */}
      <section className="relative border-t border-white/10">
        <div aria-hidden="true" className="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-accent/15 blur-[130px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <Aparece className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-accent/50 via-transparent to-cyan-400/30 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOTOS.clase}
              alt="Aaron dando una clase"
              width={912}
              height={1368}
              loading="lazy"
              className="relative aspect-[4/5] w-full rounded-3xl border border-white/15 object-cover object-[center_20%]"
            />
          </Aparece>
          <Aparece retraso={100}>
            <p className="mb-3 text-sm font-medium text-accent">Quién es Aaron</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Un barbero que enseña lo que hace todos los días.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Aaron Dalla Rosa es barbero y educador internacional. Más de 2.500 barberos pasaron por sus clases y ahora lleva ese método a un curso online, con material nuevo cada semana.
            </p>
            <h3 className="mb-4 mt-10 text-lg font-medium tracking-tight">Es para vos si...</h3>
            <ul className="space-y-3">
              {PARA_QUIEN.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-muted">
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-faint">
              No es para quien busca fórmulas mágicas o resultados sin esfuerzo.
            </p>
          </Aparece>
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
              Entrá hoy. <span className="texto-luz">Empezá ya.</span>
            </h2>
            <p className="mb-10 text-center text-sm text-muted">Pago único. Sin mensualidades.</p>
          </Aparece>
          <Suspense fallback={<div className="cristal h-96 rounded-3xl" />}>
            <SeccionOferta />
          </Suspense>

          <div className="cristal mt-6 flex items-start gap-4 rounded-2xl p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                <path d="M8.5 12.5l2.5 2.5 4.5-5" />
              </svg>
            </span>
            <div>
              <p className="font-medium tracking-tight">Garantía de {DIAS_REEMBOLSO} días</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Si en los primeros {DIAS_REEMBOLSO} días sentís que no es para vos, escribinos a soporte y te devolvemos tu pago.
              </p>
            </div>
          </div>
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
              Tu próximo nivel en la barbería <span className="texto-luz">empieza hoy.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-muted">Clases nuevas cada semana, bonos incluidos y acceso inmediato.</p>
            <a href="#comprar" className={`${ui.boton} relative mt-8 px-8 py-3.5`}>
              Quiero mi lugar
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

      <BarraMovil texto="Quiero ver la oferta" />
    </main>
  );
}
