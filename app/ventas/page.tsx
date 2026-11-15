import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Oferta from "@/components/Oferta";
import Rastreo from "@/components/Rastreo";
import Aparece from "@/components/Aparece";
import BarraMovil from "@/components/BarraMovil";
import Olas from "@/components/ventas/Olas";
import VideoAaron from "@/components/ventas/VideoAaron";
import { vagasPromoRestantes } from "@/lib/promo";
import { DIAS_BONO, DIAS_REEMBOLSO, PROMO_FIN } from "@/lib/config";
import { FOTOS } from "@/lib/fotos";

export const metadata: Metadata = {
  title: "La Nueva Ola Academy | Curso online de barbería con Aaron Dalla Rosa",
  description:
    "Aprende barbería paso a paso con Aaron Dalla Rosa: cortes completos en video, clases en vivo, comunidad y certificado. Pago único y acceso inmediato desde cualquier país.",
};

// Contenido editable: los textos se cambian acá, sin tocar el diseño.
// La página está en español neutro (tú) porque se vende a todos los países de habla hispana.
const CINTA = ["Cortes completos paso a paso", "Clases en vivo", "Comunidad de barberos", "Certificado", "Bonos incluidos", "Pago único"];

const NUMEROS = [
  { n: "+2.500", t: "barberos formados" },
  { n: "6", t: "países con cursos presenciales" },
  { n: "100 %", t: "online, a tu ritmo" },
  { n: "1 pago", t: "sin mensualidades" },
];

const PROGRAMA = [
  { n: "01", t: "Bienvenida", d: "Cómo entrar, cómo funciona la plataforma y cómo sacarle el máximo al curso desde el primer día.", m: "Inicio" },
  { n: "02", t: "Fundamentos de la barbería", d: "Herramientas, higiene, tipos de cabello, mapa de la cabeza, postura y consulta con el cliente.", m: "Base" },
  { n: "03", t: "Corte completo · 1", d: "Cómo es el corte, a quién le queda, qué herramientas usar y el paso a paso en partes, hasta el acabado.", m: "Práctica" },
  { n: "04", t: "Corte completo · 2", d: "Otro corte de principio a fin, dividido en partes cortas para pausar, repetir y practicar.", m: "Práctica" },
  { n: "05", t: "Corte completo · 3", d: "El tercer corte, con el mismo método: introducción, herramientas, corte en partes y errores comunes.", m: "Práctica" },
  { n: "＋", t: "Clases en vivo con Aaron", d: "Te conectas, preguntas por el chat y Aaron responde. Si no puedes estar, la grabación queda en el curso.", m: "En vivo" },
];

const BONOS = [
  { n: "Bono 01", t: "Color", d: "Teoría del color, decoloración, mechas y matizado para barberos." },
  { n: "Bono 02", t: "Mindset del barbero rico", d: "Hábitos, números y mentalidad para vivir bien de la barbería." },
];

const PARA_TI = [
  "Estás empezando y quieres una base sólida y ordenada.",
  "Ya cortas y quieres perfeccionar tu técnica y cobrar mejor.",
  "Quieres aprender de alguien que enseña lo que hace todos los días.",
];
const NO_PARA_TI = ["Buscas fórmulas mágicas o resultados sin practicar.", "No piensas dedicarle tiempo a las clases."];

const PREGUNTAS = [
  { q: "¿Cuándo recibo el acceso?", r: "Apenas se confirma el pago te llega un email con un botón para entrar. No hay contraseña: entras siempre con el mismo email de tu compra." },
  { q: "¿Puedo comprar desde mi país?", r: "Sí. El curso es 100 % online y está en español. El precio está en dólares y en la página de pago ves los medios disponibles en tu país." },
  { q: "¿Es un pago único?", r: "Sí. No hay mensualidades ni renovaciones automáticas. Pagas una vez." },
  { q: "¿Qué diferencia hay entre el acceso de 1 año y el vitalicio?", r: "Con el de 1 año tienes el curso por 12 meses desde tu compra. Con el vitalicio es para siempre, e incluye todas las clases y actualizaciones que se sumen." },
  { q: "¿Cómo funcionan las clases en vivo?", r: "Se anuncian dentro de la plataforma. Entras, participas por el chat y Aaron responde en directo. La grabación queda guardada en el curso." },
  { q: "¿Dan certificado?", r: "Sí. Al completar el 100 % de las clases escribes tu nombre completo y descargas tu certificado en PDF, con un código que cualquiera puede verificar en nuestra página." },
  { q: "¿Cuándo se abren los bonos?", r: `Los bonos y algunas clases se liberan ${DIAS_BONO} días después de tu compra. Los ves en tu panel con un candado y el tiempo que falta.` },
  { q: "¿Sirve si recién empiezo?", r: "Sí. El camino va de lo básico a los cortes completos, en orden, para que no te saltes nada." },
  { q: "¿Desde dónde lo veo?", r: "Desde el celular, la tablet o la computadora, cuando quieras. La plataforma recuerda dónde te quedaste." },
  { q: "¿Puedo pedir reembolso?", r: `Sí, tienes ${DIAS_REEMBOLSO} días desde tu compra. Escríbenos a soporte dentro de ese plazo y lo gestionamos.` },
];

const Flecha = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Logo() {
  return (
    <span className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-lno.png" alt="" width={36} height={36} className="h-9 w-9 rounded-[10px]" />
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-tight">La Nueva Ola</span>
        <span className="rotulo-v mt-1 block text-[9px] text-accent">Academy</span>
      </span>
    </span>
  );
}

function Seccion({ n, rotulo, children }: { n: string; rotulo: string; children: React.ReactNode }) {
  return (
    <Aparece>
      <p className="rotulo-v mb-5 flex items-center gap-3 text-faint">
        <span className="text-accent">{n}</span>
        <span className="h-px w-8 bg-line-strong" />
        {rotulo}
      </p>
      {children}
    </Aparece>
  );
}

async function SeccionOferta() {
  const restantes = await vagasPromoRestantes();
  return <Oferta vagasRestantes={restantes} promoFin={PROMO_FIN} />;
}

export default function VentasPage() {
  const video = process.env.NEXT_PUBLIC_VIDEO_VENTAS;

  return (
    <main className="touch-pan-y overflow-x-clip">
      <Rastreo path="/ventas" />

      {/* ───────── Inicio ───────── */}
      <section className="relative isolate">
        <Olas className="absolute inset-0 -z-10 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="/entrar" className="hidden text-sm text-muted transition hover:text-ink sm:block">
              Ya soy alumno
            </Link>
            <a href="#comprar" className="btn-v !px-4 !py-2.5 !text-[11px]">
              Inscribirme
            </a>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-end gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-14 lg:pb-20 lg:pt-14">
          <div>
            <p className="rotulo-v entra-v mb-6 flex items-center gap-3 text-muted">
              <span className="relative flex h-2 w-2">
                <span className="pulso-v absolute inset-0 rounded-full bg-accent" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              Curso online de barbería · Inscripciones abiertas
            </p>
            <h1 className="display text-[clamp(4.2rem,11.5vw,9.5rem)]">
              <span className="renglon">
                <span>Barbería</span>
              </span>
              <span className="renglon">
                <span className="text-accent" style={{ ["--d" as string]: "90ms" }}>
                  de verdad,
                </span>
              </span>
              <span className="renglon">
                <span style={{ ["--d" as string]: "180ms" }}>paso a paso.</span>
              </span>
            </h1>
            <p className="entra-v mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style={{ ["--d" as string]: "420ms" }}>
              Todo lo que Aaron Dalla Rosa enseñó a más de 2.500 barberos, ahora en una sola plataforma: cortes completos en video, clases en vivo, comunidad y certificado. Desde tu celular, estés
              donde estés.
            </p>
            <div className="entra-v mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "520ms" }}>
              <a href="#comprar" className="btn-v w-full sm:w-auto">
                Quiero mi lugar <Flecha />
              </a>
              <a href="#curso" className="btn-l w-full justify-center sm:w-auto">
                Ver el curso por dentro
              </a>
            </div>
            <p className="entra-v mt-5 text-sm text-faint" style={{ ["--d" as string]: "600ms" }}>
              Pago único · Acceso inmediato por email · {DIAS_REEMBOLSO} días de garantía
            </p>
          </div>

          <div className="entra-v mx-auto w-full max-w-sm lg:max-w-none" style={{ ["--d" as string]: "300ms" }}>
            <VideoAaron url={video} retrato={FOTOS.retratoRecorte} />
          </div>
        </div>

        {/* Números, en una sola línea con divisiones finas */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <dl className="grid grid-cols-2 border-t border-line-strong lg:grid-cols-4">
            {NUMEROS.map((x, i) => (
              <div key={x.t} className={`py-6 pr-4 ${i % 2 === 1 ? "border-l border-line-strong pl-5" : ""} ${i > 1 ? "border-t border-line-strong lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-5" : ""}`}>
                <dd className="display text-4xl text-ink sm:text-5xl">{x.n}</dd>
                <dt className="mt-2 text-sm text-muted">{x.t}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Cinta ───────── */}
      <div className="relative z-10 my-6 -rotate-[1.2deg] scale-x-105 overflow-hidden bg-accent py-3.5" aria-hidden="true">
        <div className="cinta-v flex w-max items-center whitespace-nowrap">
          {[...CINTA, ...CINTA, ...CINTA, ...CINTA].map((t, i) => (
            <span key={i} className="display flex items-center text-xl text-black sm:text-2xl">
              <span className="px-6">{t}</span>
              <span className="text-black/40">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* ───────── El curso ───────── */}
      <section id="curso" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <Seccion n="01" rotulo="El curso">
              <h2 className="display text-5xl sm:text-6xl lg:text-7xl">
                De la base
                <br />
                al corte <span className="text-accent">completo.</span>
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-muted">
                Un camino en orden. Primero lo fundamental; después tres cortes completos, cada uno dividido en partes cortas, donde ves a Aaron trabajar de principio a fin.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-faint">Algunas clases se abren con los días de tu compra, para que avances sin saltarte la base.</p>
            </Seccion>
          </div>

          <ol>
            {PROGRAMA.map((m, i) => (
              <Aparece key={m.t} retraso={i * 60}>
                <li className="fila-v grid grid-cols-[3.2rem_1fr] items-start gap-x-4 py-7 sm:grid-cols-[5rem_1fr_auto] sm:gap-x-6">
                  <span className="num-v display text-4xl text-faint sm:text-5xl">{m.n}</span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{m.t}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted sm:text-[15px]">{m.d}</p>
                  </div>
                  <span className="rotulo-v col-start-2 mt-3 text-accent sm:col-start-3 sm:mt-2">{m.m}</span>
                </li>
              </Aparece>
            ))}
            <li aria-hidden="true" className="border-t border-line-strong" />
          </ol>
        </div>
      </section>

      {/* ───────── La plataforma ───────── */}
      <section className="border-y border-line-strong bg-[#0a0c0d]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <Seccion n="02" rotulo="La plataforma">
            <h2 className="display max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
              No es un grupo de videos. <span className="text-accent">Es una academia.</span>
            </h2>
          </Seccion>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-line-strong bg-line-strong md:grid-cols-2 lg:grid-cols-6">
            {/* Clases */}
            <Aparece className="bg-bg p-7 sm:p-9 lg:col-span-3">
              <h3 className="text-xl font-semibold tracking-tight">Clases cortas, en orden</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">La plataforma guarda tu avance y te lleva a la clase donde te quedaste.</p>
              <div className="mt-8 space-y-2.5 text-sm">
                {[
                  ["Introducción al corte", true],
                  ["Herramientas y productos", true],
                  ["Parte 1", false],
                ].map(([t, ok], i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] border border-line bg-surface px-4 py-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${ok ? "bg-accent text-black" : "border border-line-strong text-muted"}`}>{ok ? "✓" : i + 1}</span>
                    <span className={ok ? "text-muted" : "font-medium"}>{t}</span>
                    {!ok && <span className="rotulo-v ml-auto text-[9px] text-accent">Sigues acá</span>}
                  </div>
                ))}
                <div className="pt-2">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[38%] bg-accent" />
                  </div>
                </div>
              </div>
            </Aparece>

            {/* Preguntas */}
            <Aparece retraso={80} className="bg-bg p-7 sm:p-9 lg:col-span-3">
              <h3 className="text-xl font-semibold tracking-tight">Preguntas con respuesta de Aaron</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">Debajo de cada clase dejas tu duda. Las respuestas del instructor aparecen marcadas.</p>
              <div className="mt-8 space-y-3 text-sm">
                <div className="rounded-[10px] border border-line bg-surface px-4 py-3">
                  <p className="text-xs font-semibold text-muted">Alumno</p>
                  <p className="mt-1">¿Con qué guía empiezo el degradado en cabello grueso?</p>
                </div>
                <div className="ml-6 rounded-[10px] border border-accent/40 bg-accent/[0.06] px-4 py-3">
                  <p className="flex items-center gap-2 text-xs font-semibold">
                    Aaron Dalla Rosa <span className="rotulo-v rounded-[5px] bg-accent px-1.5 py-0.5 text-[8px] text-black">Instructor</span>
                  </p>
                  <p className="mt-1 text-muted">Te lo muestro en la Parte 2, míralo y me cuentas cómo te fue.</p>
                </div>
              </div>
            </Aparece>

            {/* En vivo */}
            <Aparece className="bg-bg p-7 sm:p-9 lg:col-span-2">
              <span className="rotulo-v inline-flex items-center gap-2 rounded-[6px] bg-red-500 px-2 py-1 text-[9px] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> En vivo
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Clases en vivo con chat</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Preguntas en directo y Aaron responde. La grabación queda en el curso.</p>
            </Aparece>

            {/* Comunidad */}
            <Aparece retraso={80} className="bg-bg p-7 sm:p-9 lg:col-span-2">
              <div className="flex -space-x-2">
                {["MR", "JL", "DC", "AS"].map((x) => (
                  <span key={x} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-surface-2 text-[10px] font-semibold text-muted">
                    {x}
                  </span>
                ))}
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Comunidad de barberos</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Comparte tus cortes, mira los de otros y aprende de barberos de distintos países.</p>
            </Aparece>

            {/* Certificado */}
            <Aparece retraso={160} className="bg-bg p-7 sm:p-9 md:col-span-2 lg:col-span-2">
              <p className="rotulo-v text-[9px] text-accent">LNO-7K4D-92QX</p>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Certificado al terminar</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Completas el 100 % y descargas tu certificado en PDF, con un código verificable.</p>
            </Aparece>
          </div>
        </div>
      </section>

      {/* ───────── Aaron ───────── */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
          <Aparece className="grid grid-cols-[1.25fr_1fr] gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOTOS.auditorio} alt="Aaron frente a un auditorio lleno" width={1024} height={1536} loading="lazy" className="aspect-[3/4] w-full rounded-[6px] object-cover" />
            <div className="grid gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FOTOS.clase} alt="Aaron dando una clase" width={912} height={1368} loading="lazy" className="aspect-square w-full rounded-[6px] object-cover object-[center_25%]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FOTOS.espalda} alt="Aaron de espaldas frente al público" width={900} height={1600} loading="lazy" className="aspect-square w-full rounded-[6px] object-cover object-[center_30%]" />
            </div>
          </Aparece>

          <div>
            <Seccion n="03" rotulo="Tu instructor">
              <h2 className="display text-5xl sm:text-6xl lg:text-7xl">
                Aaron
                <br />
                Dalla Rosa.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-muted">
                Barbero y educador internacional. Más de 2.500 barberos pasaron por sus clases en 6 países, y ahora lleva ese método a una plataforma online para que lo sigas desde donde estés.
              </p>
              <p className="mt-4 max-w-md leading-relaxed text-muted">Enseña lo que hace todos los días: sin vueltas, mostrando cada paso y los errores que conviene evitar.</p>
            </Seccion>
          </div>
        </div>
      </section>

      {/* ───────── Bonos ───────── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
        <Seccion n="04" rotulo="Incluidos sin costo">
          <h2 className="display text-5xl sm:text-6xl lg:text-7xl">Dos bonos de regalo.</h2>
          <p className="mt-5 max-w-lg text-muted">Se desbloquean a los {DIAS_BONO} días de tu acceso.</p>
        </Seccion>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {BONOS.map((b, i) => (
            <Aparece key={b.t} retraso={i * 90}>
              <div className={`flex h-full min-h-64 flex-col justify-between rounded-[14px] p-7 sm:p-9 ${i === 0 ? "bg-accent text-black" : "border border-line-strong"}`}>
                <p className={`rotulo-v ${i === 0 ? "text-black/60" : "text-accent"}`}>{b.n}</p>
                <div>
                  <h3 className="display text-4xl sm:text-5xl">{b.t}</h3>
                  <p className={`mt-3 max-w-sm text-sm leading-relaxed ${i === 0 ? "text-black/70" : "text-muted"}`}>{b.d}</p>
                </div>
              </div>
            </Aparece>
          ))}
        </div>
      </section>

      {/* ───────── Para quién ───────── */}
      <section className="border-y border-line-strong">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          <Aparece className="px-5 py-16 sm:px-8 md:border-r md:border-line-strong lg:py-20">
            <h2 className="display text-4xl sm:text-5xl">Es para ti si</h2>
            <ul className="mt-8 space-y-4">
              {PARA_TI.map((p) => (
                <li key={p} className="flex items-start gap-4 text-[15px] leading-relaxed">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-black">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </Aparece>
          <Aparece retraso={80} className="border-t border-line-strong px-5 py-16 sm:px-8 md:border-t-0 lg:py-20">
            <h2 className="display text-4xl text-faint sm:text-5xl">No es para ti si</h2>
            <ul className="mt-8 space-y-4">
              {NO_PARA_TI.map((p) => (
                <li key={p} className="flex items-start gap-4 text-[15px] leading-relaxed text-muted">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong text-[11px] text-faint">✕</span>
                  {p}
                </li>
              ))}
            </ul>
          </Aparece>
        </div>
      </section>

      {/* ───────── Oferta ───────── */}
      <section className="relative isolate overflow-hidden">
        <Olas className="absolute inset-0 -z-10 h-full w-full" opacidad={0.1} lineas={16} />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-32">
          <div>
            <Seccion n="05" rotulo="Inscripción">
              <h2 className="display text-6xl sm:text-7xl lg:text-8xl">
                Entra hoy.
                <br />
                <span className="text-accent">Empieza ya.</span>
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-muted">Un solo pago. Sin mensualidades. El acceso te llega por email apenas se confirma.</p>
            </Seccion>
            <Aparece retraso={120}>
              <div className="mt-10 flex max-w-md items-start gap-4 border-t border-line-strong pt-6">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                  <path d="M8.5 12.5l2.5 2.5 4.5-5" />
                </svg>
                <div>
                  <p className="font-semibold tracking-tight">Garantía de {DIAS_REEMBOLSO} días</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">Si en los primeros {DIAS_REEMBOLSO} días sientes que no es para ti, escríbenos a soporte y te devolvemos tu pago.</p>
                </div>
              </div>
            </Aparece>
          </div>

          <div className="oferta-v">
            <Suspense fallback={<div className="h-96 rounded-[14px] border border-line-strong bg-[#0c0e0f]" />}>
              <SeccionOferta />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ───────── Preguntas ───────── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <Seccion n="06" rotulo="Dudas">
            <h2 className="display text-5xl sm:text-6xl">
              Preguntas
              <br />
              frecuentes.
            </h2>
          </Seccion>
          <div className="faq-v">
            {PREGUNTAS.map((p) => (
              <details key={p.q} className="group py-5">
                <summary className="flex items-center justify-between gap-6 text-[17px] font-medium tracking-tight">
                  {p.q}
                  <span className="text-2xl font-light text-accent transition duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{p.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Cierre ───────── */}
      <section className="bg-accent text-black">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-24">
          <h2 className="display text-6xl sm:text-7xl lg:text-8xl">
            Tu próximo nivel
            <br />
            empieza hoy.
          </h2>
          <a href="#comprar" className="inline-flex items-center gap-3 rounded-[10px] bg-black px-7 py-4 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-[#151718]">
            Quiero mi lugar <Flecha />
          </a>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-faint sm:px-8">
          <span>© La Nueva Ola Academy · Aaron Dalla Rosa. Todos los derechos reservados.</span>
          <Link href="/entrar" className="transition hover:text-muted">
            ¿Ya eres alumno? Entra acá
          </Link>
        </div>
      </footer>

      <BarraMovil texto="Quiero ver la oferta" />
    </main>
  );
}
