import type { Metadata } from "next";
import FormCaptura from "@/components/FormCaptura";
import Rastreo from "@/components/Rastreo";
import { BRAND, PRECOS } from "@/lib/config";
import { FOTOS } from "@/lib/fotos";

export const metadata: Metadata = {
  title: "Entrá primero a la plataforma de Aaron: 50% OFF y acceso vitalicio | Lista de espera",
  description:
    "Todo el conocimiento de Aaron Dalla Rosa en una sola plataforma. Anotate en la lista de espera y entrá al grupo de WhatsApp: acceso antes que nadie, 50% de descuento de lanzamiento y acceso vitalicio.",
};

// Contenido editable de la página (cambiá los textos acá, sin tocar el diseño).
const CINTA = ["50% OFF en el lanzamiento", "Acceso antes que nadie", "Acceso vitalicio", "Solo para la lista y el grupo de WhatsApp", "Todo el conocimiento de Aaron"];

const PROBLEMAS = [
  "Contenido suelto en redes, sin un orden para aprender.",
  "Cursos que enseñan una técnica y te dejan sin el resto del camino.",
  "No saber por dónde seguir ni a quién preguntarle.",
];

const INCLUYE = [
  { t: "Todo el conocimiento de Aaron", d: "Los años de experiencia de Aaron reunidos y ordenados en un solo lugar." },
  { t: "Lo que enseñó en varios países", d: "El método que Aaron llevó a cursos en distintos países, ahora a tu ritmo y desde tu casa." },
  { t: "Módulos que se liberan con el tiempo", d: "Un camino paso a paso: cada módulo se abre en su momento para que avances sin saltearte nada." },
  { t: "Clases nuevas cada semana", d: "La plataforma crece: un video nuevo todos los lunes." },
  { t: "Desde el celular o la computadora", d: "Entrás con tu email y seguís donde te quedaste, en cualquier dispositivo." },
  { t: "Bonos de lanzamiento", d: "Quienes entren primero reciben bonos exclusivos. Los anunciamos en el grupo." },
];

const VENTAJAS = [
  { t: "Entrás antes que nadie", d: "Abrimos la plataforma primero para la lista de espera y el grupo de WhatsApp, antes del lanzamiento oficial. Cuando se abra al público, vos ya estás adentro." },
  { t: "50% de descuento de lanzamiento", d: "Un precio exclusivo para quienes están en la lista y en el grupo. No se repite cuando abramos al público." },
  { t: "Acceso vitalicio", d: "Pagás una sola vez y la plataforma es tuya para siempre, con todas las clases nuevas que se sumen." },
];

const PARA_QUIEN = [
  "Barberos que ya trabajan y quieren perfeccionar su técnica.",
  "Quienes están empezando y quieren una base sólida y ordenada.",
  "Quienes quieren seguir aprendiendo con alguien que enseña lo que hace todos los días.",
];

const Check = () => (
  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.7 2.7L16 9.8" />
  </svg>
);

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`cristal absolute z-20 rounded-2xl px-4 py-3 text-sm ${className}`}>
      {children}
    </div>
  );
}

export default function CapturaPage() {
  return (
    <main className="touch-pan-y overflow-x-clip">
      <Rastreo path="/captura" />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Luces */}
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
          {/* Tarjeta */}
          <div className="cristal relative overflow-hidden rounded-3xl p-7 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Lista de espera abierta · Cupos limitados
            </p>
            <h1 className="text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Todo lo que Aaron aprendió en años de barbería. <span className="texto-luz">50% OFF y tuyo para siempre.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              La primera plataforma de Aaron Dalla Rosa para barberos. Quien se anota y entra al grupo de WhatsApp accede antes que todos, con un descuento de lanzamiento que no se repite.
            </p>
            <ul className="mb-8 mt-6 space-y-2.5">
              {[
                "Acceso antes de que abra al público",
                `50% de descuento, solo para la lista y el grupo (primeras ${PRECOS.promo.vagas} personas)`,
                "Acceso vitalicio: pagás una vez y es tuyo para siempre",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-medium">
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
            <div className="max-w-md">
              <FormCaptura id="hero" textoBoton="Quiero mi 50% de descuento" />
            </div>
          </div>

          {/* Foto de Aaron */}
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
              <p className="text-sm font-medium">50% OFF + acceso vitalicio</p>
              <p className="text-xs text-muted">solo lista de espera y grupo</p>
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

      {/* Problema */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div aria-hidden="true" className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent/10 blur-[110px]" />
        <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              El problema que <span className="texto-luz">vamos a resolver</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Aprender barbería hoy es un camino desordenado. Mucha gente sabe cortar, pero le falta una guía clara para seguir creciendo.
            </p>
            <p className="mt-6 text-sm font-medium">Lo que más se repite:</p>
            <ul className="mt-3 space-y-3">
              {PROBLEMAS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.8)]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="cristal relative overflow-hidden rounded-3xl p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
            <p className="relative text-sm font-medium text-accent">La respuesta</p>
            <p className="relative mt-3 text-xl font-medium leading-snug tracking-tight sm:text-2xl">
              Aaron está juntando todo su conocimiento en una plataforma pensada para que aprendas en orden, a tu ritmo y con alguien que lo hace todos los días.
            </p>
          </div>
        </div>
      </section>

      {/* Qué vas a encontrar */}
      <section className="relative border-y border-white/10 bg-white/[0.015]">
        <div aria-hidden="true" className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Qué vas a <span className="texto-luz">encontrar</span>
          </h2>
          <p className="mt-3 max-w-lg text-muted">Una plataforma hecha para barberos, con todo el contenido en un solo lugar.</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUYE.map((i, n) => (
              <div key={i.t} className="cristal group relative overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_rgba(57,255,126,.35)]">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">{n + 1}</span>
                <h3 className="font-medium tracking-tight">{i.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué anotarte ahora */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Lo que se llevan <span className="texto-luz">solo quienes están adentro</span></h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {VENTAJAS.map((v, i) => (
            <div key={v.t} className="relative rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/[0.08] to-transparent p-6">
              <p className="mb-6 text-4xl font-semibold tracking-tight text-accent/90">0{i + 1}</p>
              <h3 className="text-lg font-medium tracking-tight">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quién es Aaron / para quién */}
      <section className="relative border-t border-white/10">
        <div aria-hidden="true" className="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-accent/15 blur-[130px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div className="relative mx-auto w-full max-w-md">
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
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-accent">Quién es Aaron</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Un barbero que enseña lo que hace todos los días.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Aaron Dalla Rosa es barbero y educador internacional. Más de 2.500 barberos pasaron por sus clases y ahora reúne todo ese conocimiento en una plataforma digital.
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
          </div>
        </div>
      </section>

      {/* Formulario final */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-top opacity-30"
            style={{ backgroundImage: `linear-gradient(0deg, #07090a 5%, transparent 60%, #07090a 100%), url(${FOTOS.auditorio})` }}
          />
          <div className="respirar absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[130px]" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="cristal relative mx-auto max-w-md overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="text-center text-sm font-medium text-accent">{BRAND}</p>
            <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight">Asegurá tu 50% de descuento</h2>
            <p className="mb-7 mt-3 text-center text-sm leading-relaxed text-muted">
              Dejá tu email y entrá al grupo de WhatsApp. Es la forma de entrar antes que todos, con 50% de descuento y acceso para siempre.
            </p>
            <FormCaptura id="final" textoBoton="Quiero entrar primero con 50% OFF" />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-faint">
          <span>© {BRAND}. Todos los derechos reservados.</span>
        </div>
      </footer>
    </main>
  );
}
