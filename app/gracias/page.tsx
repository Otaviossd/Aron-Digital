export default function GraciasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-acid">
          Pago recibido
        </p>
        <h1 className="mb-6 text-5xl font-black uppercase leading-[0.95] tracking-tight">
          Revisá tu <span className="text-acid">email</span>
        </h1>
        <p className="mb-4 text-white/70">
          En unos segundos te llega un correo con tu acceso al curso. Si no aparece, mirá en spam o
          promociones.
        </p>
        <p className="text-sm text-white/50">
          También podés entrar siempre desde{" "}
          <a href="/entrar" className="underline hover:text-acid">
            la página de acceso
          </a>{" "}
          con el email que usaste al comprar.
        </p>
      </div>
    </main>
  );
}
