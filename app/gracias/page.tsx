import Link from "next/link";

export default function GraciasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md">
        <p className="mb-4 text-sm font-medium text-accent">Pago recibido</p>
        <h1 className="mb-5 text-4xl font-semibold tracking-tight">Revisá tu email.</h1>
        <p className="mb-4 leading-relaxed text-muted">
          En unos segundos te llega un correo con tu acceso al curso. Si no aparece, mirá en spam o promociones.
        </p>
        <p className="text-sm text-faint">
          También podés entrar siempre desde{" "}
          <Link href="/entrar" className="text-muted underline underline-offset-4 hover:text-ink">
            la página de acceso
          </Link>{" "}
          con el email que usaste al comprar.
        </p>
      </div>
    </main>
  );
}
