import Link from "next/link";
import { ui } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden px-6">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="rejilla absolute inset-0" />
        <div className="respirar absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
      </div>
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-accent">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">No encontramos esta página</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Puede que el enlace esté incompleto o que la página se haya movido. Si recién compraste, entrá con el mismo email de tu compra.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/aulas" className={ui.boton}>
            Ir a mi curso
          </Link>
          <Link href="/entrar" className={ui.botonSuave}>
            Entrar con mi email
          </Link>
        </div>
      </div>
    </main>
  );
}
