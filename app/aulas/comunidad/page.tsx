import { Suspense } from "react";
import { ui } from "@/lib/ui";
import ComentariosCargados from "@/components/members/ComentariosCargados";

export default function ComunidadPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className={ui.etiqueta}>Comunidad</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Barberos de La Nueva Ola</h1>
      <p className="mt-2 max-w-xl text-muted">
        Mostrá tus cortes, preguntá lo que quieras y ayudá a otros. Aaron también pasa por acá.
      </p>
      <div className="mt-8 rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />}>
          <ComentariosCargados
            tipo="comunidad"
            placeholder="Compartí un corte, una duda o una victoria…"
            vacio="Todavía no hay publicaciones. Escribí la primera y abrí la comunidad."
          />
        </Suspense>
      </div>
    </div>
  );
}
