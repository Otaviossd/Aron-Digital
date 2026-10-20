import { Suspense } from "react";
import Link from "next/link";
import Checkout from "@/components/Checkout";
import NavAcceso from "@/components/NavAcceso";
import Rastreo from "@/components/Rastreo";
import { BRAND } from "@/lib/config";
import { FOTOS, fondoFoto } from "@/lib/fotos";

const INCLUYE = [
  { n: "01", titulo: "Clases nuevas cada semana", texto: "Un video nuevo todos los lunes. El curso crece mientras vos crecés." },
  { n: "02", titulo: "Acceso inmediato", texto: "Pagás y te llega el acceso por email en segundos. Sin esperas, sin grupos." },
  { n: "03", titulo: "Del cero al corte", texto: "Pensado para quien empieza: técnica, herramientas y paso a paso en video." },
  { n: "04", titulo: "Desde cualquier lugar", texto: "Celular, tablet o computadora. Mirá las clases cuando quieras." },
];

const linkAcceso = (
  <Link href="/entrar" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-white/5">
    Acceder
  </Link>
);

export default function Home() {
  return (
    <main>
      <Rastreo path="/ventas" />
      {/* Hero */}
      <section className="relative isolate overflow-hidden" style={fondoFoto(FOTOS.hero)}>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_0%,rgba(205,180,138,.14),transparent)]" />
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-sm font-semibold tracking-tight">{BRAND}</span>
          <Suspense fallback={linkAcceso}>
            <NavAcceso />
          </Suspense>
        </nav>

        <div className="mx-auto max-w-6xl px-6 pb-28 pt-20 sm:pb-40 sm:pt-32">
          <p className="mb-6 text-sm font-medium text-accent">Curso online de barbería</p>
          <h1 className="max-w-3xl text-[clamp(2.5rem,7vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Aprendé barbería <span className="text-ink/55">de verdad.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            Con Aaron Dalla Rosa, barbero educador internacional que ya formó a más de 2.500 barberos. Clases nuevas
            cada semana, directo a tu celular.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#comprar"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-bg transition hover:bg-white/85"
            >
              Quiero acceso ahora
            </a>
            <a href="#incluye" className="px-2 py-3.5 text-sm font-medium text-muted transition hover:text-ink">
              Ver qué incluye ↓
            </a>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section id="incluye" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-md text-3xl font-semibold tracking-tight">Todo lo que necesitás para empezar.</h2>
        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {INCLUYE.map((b) => (
            <div key={b.n} className="border-t border-line pt-6">
              <p className="mb-4 text-xs font-medium text-accent">{b.n}</p>
              <h3 className="mb-2 text-lg font-medium tracking-tight">{b.titulo}</h3>
              <p className="max-w-sm text-sm leading-relaxed text-muted">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre Aaron */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div
            className="aspect-[4/5] w-full max-w-md rounded-2xl border border-line bg-surface-2"
            style={fondoFoto(FOTOS.sobre, "linear-gradient(180deg, rgba(10,10,10,0) 55%, rgba(10,10,10,.55) 100%)")}
          />
          <div>
            <p className="mb-4 text-sm font-medium text-accent">Quién es Aaron</p>
            <h2 className="text-3xl font-semibold tracking-tight">Un barbero que enseña lo que hace todos los días.</h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              Aaron Dalla Rosa es barbero y educador internacional. Más de 2.500 barberos pasaron por sus clases y
              ahora lleva ese método a un curso online, con material nuevo cada semana.
            </p>
          </div>
        </div>
      </section>

      {/* Checkout directo */}
      <section className="mx-auto max-w-xl px-6 py-24">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">Entrá hoy. Empezá ya.</h2>
        <Checkout />
        <p className="mt-8 text-center text-sm text-faint">
          ¿Ya sos alumno?{" "}
          <Link href="/entrar" className="text-muted underline underline-offset-4 transition hover:text-ink">
            Entrá acá
          </Link>
        </p>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-faint">
          <span>© {BRAND}</span>
          <Link href="/equipo" className="transition hover:text-muted">
            Equipo
          </Link>
        </div>
      </footer>
    </main>
  );
}
