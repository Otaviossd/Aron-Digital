import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import FormCaptura from "@/components/FormCaptura";
import NavAcceso from "@/components/NavAcceso";
import Rastreo from "@/components/Rastreo";
import { BRAND } from "@/lib/config";
import { FOTOS, fondoFoto } from "@/lib/fotos";

export const metadata: Metadata = {
  title: "La nueva plataforma de Aaron para barberos | Lista de espera",
  description:
    "Todo el conocimiento de Aaron Dalla Rosa en una sola plataforma. Anotate en la lista de espera: entrás primero y te llevás un descuento exclusivo.",
};

// Contenido editable de la página (cambiá los textos acá, sin tocar el diseño).
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
  { t: "Acceso antes que nadie", d: "La lista de espera entra primero, antes de que abramos al público." },
  { t: "Descuento exclusivo", d: "Solo para quienes se anotan y entran al grupo de WhatsApp." },
  { t: "Bonos de lanzamiento", d: "Los primeros en entrar reciben beneficios que después no vuelven." },
];

const PARA_QUIEN = [
  "Barberos que ya trabajan y quieren perfeccionar su técnica.",
  "Quienes están empezando y quieren una base sólida y ordenada.",
  "Quienes quieren seguir aprendiendo con alguien que enseña lo que hace todos los días.",
];

const acceder = (
  <Link href="/entrar" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-white/5">
    Acceder
  </Link>
);

const Check = () => (
  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.7 2.7L16 9.8" />
  </svg>
);

export default function CapturaPage() {
  return (
    <main>
      <Rastreo path="/captura" />

      {/* Hero con foto y formulario */}
      <section
        className="relative isolate overflow-hidden"
        style={fondoFoto(FOTOS.captura, "linear-gradient(90deg, rgba(10,10,10,.97) 0%, rgba(10,10,10,.85) 38%, rgba(10,10,10,.25) 70%, rgba(10,10,10,.1) 100%)", "right center")}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_85%_20%,rgba(205,180,138,.16),transparent)]" />
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-sm font-semibold tracking-tight">{BRAND}</span>
          <Suspense fallback={acceder}>
            <NavAcceso />
          </Suspense>
        </nav>

        <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pb-32 sm:pt-20">
          <div className="max-w-xl">
            <p className="mb-5 text-sm font-medium text-accent">Lista de espera · Muy pronto</p>
            <h1 className="text-[clamp(2.1rem,5.2vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Todo lo que Aaron aprendió en años de barbería, <span className="text-ink/55">en una sola plataforma.</span>
            </h1>
            <p className="mb-8 mt-6 text-base leading-relaxed text-muted sm:text-lg">
              Una nueva plataforma digital para barberos que quieren profundizar su conocimiento. Anotate en la lista de
              espera: entrás primero y te llevás un descuento exclusivo.
            </p>
            <div className="max-w-sm rounded-2xl border border-line bg-black/50 p-5 backdrop-blur">
              <FormCaptura id="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              El problema que <span className="text-accent">vamos a resolver</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Aprender barbería hoy es un camino desordenado. Mucha gente sabe cortar, pero le falta una guía clara para
              seguir creciendo.
            </p>
            <p className="mt-6 text-sm font-medium">Lo que más se repite:</p>
            <ul className="mt-3 space-y-3">
              {PROBLEMAS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-8">
            <p className="text-sm font-medium text-accent">La respuesta</p>
            <p className="mt-3 text-xl font-medium leading-snug tracking-tight">
              Aaron está juntando todo su conocimiento en una plataforma pensada para que aprendas en orden, a tu ritmo y
              con alguien que lo hace todos los días.
            </p>
          </div>
        </div>
      </section>

      {/* Qué vas a encontrar */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl font-semibold tracking-tight">
            Qué vas a <span className="text-accent">encontrar</span>
          </h2>
          <p className="mt-3 max-w-lg text-muted">Una plataforma hecha para barberos, con todo el contenido en un solo lugar.</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUYE.map((i) => (
              <div key={i.t} className="rounded-2xl border border-line bg-bg p-6">
                <h3 className="font-medium tracking-tight text-accent">{i.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué anotarte ahora */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Por qué anotarte hoy en la lista de espera</h2>
        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {VENTAJAS.map((v, i) => (
            <div key={v.t} className="border-t border-line pt-6">
              <p className="mb-4 text-xs font-medium text-accent">0{i + 1}</p>
              <h3 className="text-lg font-medium tracking-tight">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quién es Aaron / para quién */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div
            className="aspect-[4/5] w-full max-w-md rounded-2xl border border-line bg-surface-2"
            style={fondoFoto(FOTOS.sobre, "linear-gradient(180deg, rgba(10,10,10,0) 55%, rgba(10,10,10,.55) 100%)")}
          />
          <div>
            <p className="mb-3 text-sm font-medium text-accent">Quién es Aaron</p>
            <h2 className="text-3xl font-semibold tracking-tight">Un barbero que enseña lo que hace todos los días.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Aaron Dalla Rosa es barbero y educador internacional. Más de 2.500 barberos pasaron por sus clases y ahora
              reúne todo ese conocimiento en una plataforma digital.
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
            <p className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-faint">
              No es para quien busca fórmulas mágicas o resultados sin esfuerzo.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario final */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-md rounded-3xl bg-ink p-8 text-bg shadow-2xl shadow-black/50 sm:p-10">
          <p className="text-center text-sm font-medium text-black/50">{BRAND}</p>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight">Próximos pasos</h2>
          <p className="mb-7 mt-3 text-center text-sm leading-relaxed text-black/60">
            Dejá tu email y entrá al grupo de WhatsApp para asegurar tu descuento exclusivo y ser de los primeros en entrar.
          </p>
          <FormCaptura tono="claro" id="final" textoBoton="Quiero asegurar mi lugar" />
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-faint">
          <span>© {BRAND}. Todos los derechos reservados.</span>
          <Link href="/equipo" className="transition hover:text-muted">
            Equipo
          </Link>
        </div>
      </footer>
    </main>
  );
}
