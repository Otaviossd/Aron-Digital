import type { Metadata } from "next";
import FormCaptura from "@/components/FormCaptura";
import Rastreo from "@/components/Rastreo";
import { BRAND, DIAS_REEMBOLSO, LANZAMIENTO_APERTURA, PRECOS } from "@/lib/config";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import { FOTOS } from "@/lib/fotos";
import Aparece from "@/components/Aparece";

export const metadata: Metadata = {
  title: "Los primeros 50 pagan la mitad y entran para siempre | Plataforma de Aaron Dalla Rosa",
  description:
    "Aaron Dalla Rosa abre su plataforma de barbería el sábado 14 de noviembre. Anotate y entrá al grupo de WhatsApp: los primeros 50 pagan la mitad del plan anual, acceso vitalicio y bonos exclusivos. Cuando se agotan los cupos, se termina.",
};

// Contenido editable de la página (cambiá los textos acá, sin tocar el diseño).
const CINTA = [
  `Solo ${PRECOS.promo.vagas} cupos con precio de lanzamiento`,
  "Pagás la mitad del plan anual",
  "Acceso vitalicio",
  "Solo lista de espera + grupo de WhatsApp",
  "Bonos exclusivos para los primeros 50",
  "Clases en vivo con Aaron",
  "Certificado al terminar",
];

const PROBLEMAS = [
  "Videos sueltos en redes, sin un orden para aprender.",
  "Cursos que te enseñan una técnica y te dejan solo con el resto.",
  "Dudas que nadie te responde cuando más las necesitás.",
];

const INCLUYE = [
  { t: "Un camino ordenado, paso a paso", d: "Todo el conocimiento de Aaron en módulos que se abren en el orden correcto, para que avances sin saltearte nada." },
  { t: "Preguntale a Aaron en cada clase", d: "Debajo de cada video hay una pestaña de comentarios. Preguntás y Aaron te responde, con su sello de instructor verificado." },
  { t: "Clases en vivo con Aaron", d: "Aaron sale en vivo, entrás, escribís en el chat y te contesta en directo. Si no llegás, queda grabada completa para siempre." },
  { t: "Una comunidad de barberos", d: "Mostrá tus cortes, compartí dudas y aprendé con otros barberos que están en el mismo camino." },
  { t: "Certificado al terminar", d: "Completás el 100 % del curso y generás tu certificado en PDF, firmado por Aaron y con código de verificación online." },
  { t: "Clases nuevas y bonos", d: "Un video nuevo cada semana y bonos como el de Color. Los primeros 50 se llevan, además, bonos exclusivos." },
];

const PASOS = [
  { t: "Dejás tu email y entrás al grupo", d: "Son los dos pasos. El grupo de WhatsApp es donde avisamos primero y donde te enterás de los bonos exclusivos." },
  { t: "El sábado 14 de noviembre, a las 9:00, abrimos", d: "Hora de Paraguay. Quienes están en la lista y en el grupo reciben el aviso antes que nadie." },
  { t: `Los primeros ${PRECOS.promo.vagas} entran con precio de lanzamiento`, d: "Pagás una sola vez, entrás para siempre y recibís los bonos exclusivos. Cuando se llenan los cupos, se termina." },
];

const VENTAJAS = [
  { t: "Pagás la mitad", d: `US$${PRECOS.promo.valor} en vez de US$${PRECOS.anual.valor}, que es lo que cuesta el plan anual. Una sola vez.` },
  { t: "Es tuyo para siempre", d: `El acceso vitalicio normal cuesta US$${PRECOS.vitalicio.valor}. Vos lo llevás por US$${PRECOS.promo.valor}, con todas las clases nuevas que se sumen.` },
  { t: "Bonos que no se venden después", d: "Material exclusivo solo para los primeros 50. Quien llega después no los tiene, a ningún precio." },
];

const PARA_QUIEN = [
  "Barberos que ya trabajan y quieren perfeccionar su técnica.",
  "Quienes están empezando y quieren una base sólida y ordenada.",
  "Quienes quieren aprender con alguien que enseña lo que hace todos los días.",
];

const PREGUNTAS = [
  { q: "¿Qué pasa si no entro al grupo de WhatsApp?", a: "El precio de lanzamiento es solo para quienes se anotan y entran al grupo. Es ahí donde avisamos cuándo abre y cómo entrar con los 50 cupos. Sin el grupo, te lo perdés." },
  { q: "¿Qué significa vitalicio?", a: "Pagás una sola vez y accedés para siempre, incluidas todas las clases nuevas que se agreguen. Sin renovaciones ni mensualidades." },
  { q: "¿Y si después de entrar no es lo que esperaba?", a: `Tenés ${DIAS_REEMBOLSO} días de garantía: si no es para vos, te devolvemos el dinero.` },
  { q: "¿Cuándo se acaban los cupos?", a: `Cuando compre la persona número ${PRECOS.promo.vagas}, o a los 3 días de abrir, lo que pase primero. Después de eso el precio de lanzamiento no vuelve.` },
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
        {/* Luces (degradados, sin desenfoques animados: la página va fluida en el celular) */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="rejilla absolute inset-0" />
          <div className="luz respirar absolute -right-40 -top-24 h-[48rem] w-[48rem] [--luz:rgba(57,255,126,0.28)]" />
          <div className="luz absolute -left-56 top-[26rem] h-[38rem] w-[38rem] [--luz:rgba(34,211,238,0.12)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
        </div>

        <nav className="mx-auto flex max-w-6xl items-center px-6 py-6">
          <span className="text-sm font-semibold tracking-tight">{BRAND}</span>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-10">
          {/* Tarjeta */}
          <div className="cristal escalonado relative overflow-hidden rounded-3xl p-7 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Lista de espera · Solo {PRECOS.promo.vagas} cupos con precio de lanzamiento
            </p>
            <h1 className="text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Aaron abre su plataforma. <span className="texto-luz">Los primeros {PRECOS.promo.vagas} pagan la mitad y se quedan para siempre.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Todo lo que Aaron Dalla Rosa aprendió en años de barbería, en un solo lugar: clases, lives con él, comunidad y certificado. El precio de lanzamiento es solo para quien se anota acá y entra al grupo de WhatsApp. Cuando se llenen los {PRECOS.promo.vagas} cupos, se terminó.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-2 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5">
              <p className="text-5xl font-semibold leading-none tracking-tight text-accent">US${PRECOS.promo.valor}</p>
              <div className="pb-0.5 text-sm leading-snug">
                <p className="font-medium">Pago único · acceso vitalicio</p>
                <p className="text-faint">
                  Plan anual <span className="line-through">US${PRECOS.anual.valor}</span> · Vitalicio normal <span className="line-through">US${PRECOS.vitalicio.valor}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">Abrimos el sábado 14 de noviembre · 9:00 (hora de Paraguay)</p>
              <CuentaRegresiva fin={LANZAMIENTO_APERTURA} />
            </div>

            <ul className="mb-8 mt-6 space-y-2.5">
              {[
                "Solo si te anotás y entrás al grupo de WhatsApp. Sin los dos pasos, no hay precio de lanzamiento",
                "Bonos exclusivos que reciben únicamente los primeros 50",
                "Cuando los cupos se terminan, la oferta desaparece y no vuelve",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-medium">
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
            <div className="max-w-md">
              <FormCaptura id="hero" textoBoton={`Quiero mi lugar entre los ${PRECOS.promo.vagas}`} />
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
              <p className="text-sm font-medium">US${PRECOS.promo.valor} de por vida</p>
              <p className="text-xs text-muted">solo los primeros {PRECOS.promo.vagas}</p>
            </Chip>
          </div>
        </div>
      </section>

      {/* Cinta */}
      <div className="overflow-hidden border-y border-white/10 bg-white/[0.02] py-4" aria-hidden="true">
        <div className="cinta flex w-max gap-10 whitespace-nowrap">
          {[...CINTA, ...CINTA, ...CINTA].map((t, i) => (
            <span key={i} className="flex items-center gap-10 text-sm font-medium text-ink/80">
              {t}
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(57,255,126,.9)]" />
            </span>
          ))}
        </div>
      </div>

      {/* Problema */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div aria-hidden="true" className="luz absolute -left-40 top-0 h-[28rem] w-[28rem] [--luz:rgba(57,255,126,0.1)]" />
        <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
          <Aparece>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Cortar bien no alcanza si nadie te <span className="texto-luz">guía el camino</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Aprender barbería hoy es un camino desordenado. Mucha gente sabe cortar, pero le falta una guía clara, alguien a quien preguntarle y una comunidad que lo empuje.
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
          </Aparece>
          <Aparece retraso={120}>
            <div className="cristal relative overflow-hidden rounded-3xl p-8">
              <div className="luz absolute -right-16 -top-16 h-56 w-56" />
              <p className="relative text-sm font-medium text-accent">La respuesta</p>
              <p className="relative mt-3 text-xl font-medium leading-snug tracking-tight sm:text-2xl">
                Una plataforma donde aprendés en orden, le preguntás directo a Aaron en cada clase, lo ves en vivo y avanzás junto a otros barberos.
              </p>
            </div>
          </Aparece>
        </div>
      </section>

      {/* Qué vas a encontrar */}
      <section className="relative border-y border-white/10 bg-white/[0.015]">
        <div aria-hidden="true" className="luz absolute -right-24 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 [--luz:rgba(34,211,238,0.09)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <Aparece>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Lo que vas a tener <span className="texto-luz">adentro</span>
            </h2>
            <p className="mt-3 max-w-lg text-muted">No es un video suelto: es una plataforma completa, hecha para barberos.</p>
          </Aparece>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUYE.map((i, n) => (
              <Aparece key={i.t} retraso={n * 70}>
                <div className="cristal group relative h-full overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_rgba(57,255,126,.35)]">
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">{n + 1}</span>
                  <h3 className="font-medium tracking-tight">{i.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{i.d}</p>
                </div>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Aparece>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Cómo asegurás <span className="texto-luz">tu precio de lanzamiento</span>
          </h2>
        </Aparece>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.t}>
              <Aparece retraso={i * 90}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-[#04120a]">{i + 1}</span>
                  <h3 className="mt-4 text-lg font-medium leading-snug tracking-tight">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.d}</p>
                </div>
              </Aparece>
            </li>
          ))}
        </ol>
      </section>

      {/* Lo que se llevan solo los primeros 50 */}
      <section className="relative border-y border-white/10">
        <div aria-hidden="true" className="luz absolute left-1/2 top-0 h-[26rem] w-[44rem] max-w-full -translate-x-1/2 [--luz:rgba(57,255,126,0.1)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <Aparece>
            <p className="mb-3 text-sm font-medium text-accent">Solo {PRECOS.promo.vagas} lugares</p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Lo que se llevan <span className="texto-luz">únicamente los primeros {PRECOS.promo.vagas}</span>
            </h2>
          </Aparece>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {VENTAJAS.map((v, i) => (
              <Aparece key={v.t} retraso={i * 90}>
                <div className="relative h-full rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/[0.08] to-transparent p-6">
                  <p className="mb-6 text-4xl font-semibold tracking-tight text-accent/90">0{i + 1}</p>
                  <h3 className="text-lg font-medium tracking-tight">{v.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
                </div>
              </Aparece>
            ))}
          </div>
          <Aparece>
            <p className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">Cuando se llenan los {PRECOS.promo.vagas} cupos, se termina.</span> No hay segunda ronda ni precio especial después. Quien no está en la lista y en el grupo, se entera cuando ya no queda nada.
            </p>
          </Aparece>
        </div>
      </section>

      {/* Quién es Aaron / para quién */}
      <section className="relative">
        <div aria-hidden="true" className="luz absolute -left-32 top-1/4 h-[32rem] w-[32rem] [--luz:rgba(57,255,126,0.12)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-accent/40 via-transparent to-cyan-400/25 blur-xl" />
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
              Aaron Dalla Rosa es barbero y educador internacional. Más de 2.500 barberos pasaron por sus clases y ahora reúne todo ese conocimiento en una plataforma donde vas a poder hablar con él.
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

      {/* Preguntas */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Aparece>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Antes de anotarte</h2>
        </Aparece>
        <div className="mt-10 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {PREGUNTAS.map((p) => (
            <details key={p.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium tracking-tight">
                {p.q}
                <span aria-hidden="true" className="text-xl text-accent transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Formulario final */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-top opacity-30"
            style={{ backgroundImage: `linear-gradient(0deg, #07090a 5%, transparent 60%, #07090a 100%), url(${FOTOS.auditorio})` }}
          />
          <div className="luz respirar absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 [--luz:rgba(57,255,126,0.26)]" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="cristal relative mx-auto max-w-md overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <p className="text-center text-sm font-medium text-accent">{BRAND}</p>
            <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight">Tu lugar entre los {PRECOS.promo.vagas} empieza acá</h2>
            <p className="mb-7 mt-3 text-center text-sm leading-relaxed text-muted">
              Dejá tu email y entrá al grupo de WhatsApp: US${PRECOS.promo.valor} una sola vez, acceso para siempre y bonos exclusivos. Cuando se llenen los cupos, se termina.
            </p>
            <FormCaptura id="final" textoBoton={`Quiero mi lugar entre los ${PRECOS.promo.vagas}`} />
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
