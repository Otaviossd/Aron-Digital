import Checkout from "@/components/Checkout";

const BENEFICIOS = [
  { titulo: "Clases nuevas cada semana", texto: "Un video nuevo todos los lunes. El curso crece mientras vos crecés." },
  { titulo: "Acceso inmediato", texto: "Pagás y te llega el acceso por email en segundos. Sin esperas, sin grupos." },
  { titulo: "Del cero al corte", texto: "Pensado para quien empieza: técnica, herramientas y paso a paso en video." },
  { titulo: "Desde cualquier lugar", texto: "Celular, tablet o computadora. Mirá las clases cuando quieras." },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:pt-24">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-acid">
          Curso online de barbería
        </p>
        <h1 className="text-[clamp(3rem,11vw,8rem)] font-black uppercase leading-[0.9] tracking-tighter">
          Aprendé <br />
          barbería <span className="text-acid">de verdad</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-white/70">
          Con Aaron Dalla Rosa, barbero educador internacional que ya formó a más de 2.500
          barberos. Clases nuevas cada semana, directo a tu celular.
        </p>
        <a
          href="#comprar"
          className="mt-10 inline-block border-2 border-acid bg-acid px-8 py-5 text-sm font-black uppercase tracking-widest text-black transition hover:bg-transparent hover:text-acid"
        >
          Quiero acceso ahora
        </a>
      </section>

      {/* Beneficios */}
      <section className="border-y border-white/10">
        <div className="mx-auto grid max-w-5xl gap-px bg-white/10 sm:grid-cols-2">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="bg-black p-8">
              <h2 className="mb-2 text-xl font-black uppercase tracking-tight text-acid">
                {b.titulo}
              </h2>
              <p className="text-white/70">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout directo */}
      <section className="mx-auto max-w-xl px-5 py-20">
        <h2 className="mb-8 text-4xl font-black uppercase leading-none tracking-tight">
          Entrá hoy. <span className="text-acid">Empezá ya.</span>
        </h2>
        <Checkout />
        <p className="mt-6 text-center text-xs text-white/40">
          ¿Ya sos alumno?{" "}
          <a href="/entrar" className="underline hover:text-acid">
            Entrá acá
          </a>
        </p>
      </section>
    </main>
  );
}
