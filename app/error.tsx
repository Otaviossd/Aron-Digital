"use client";

import Link from "next/link";
import { ui } from "@/lib/ui";

// Si algo falla en el servidor o en la conexión, el alumno puede reintentar con un botón en vez de ver una pantalla rota.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden px-6">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="rejilla absolute inset-0" />
        <div className="respirar absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
      </div>
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Algo no cargó bien</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">Fue un problema momentáneo. Tocá el botón para intentar de nuevo; tu progreso no se perdió.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className={ui.boton}>
            Intentar de nuevo
          </button>
          <Link href="/aulas" className={ui.botonSuave}>
            Volver al curso
          </Link>
        </div>
      </div>
    </main>
  );
}
