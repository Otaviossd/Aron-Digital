import { Suspense } from "react";
import { ui } from "@/lib/ui";
import ComunidadCargada from "@/components/members/ComunidadCargada";

export default function ComunidadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className={ui.etiqueta}>Comunidad</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Barberos de La Nueva Ola</h1>
      <p className="mt-2 max-w-xl text-muted">
        Mostrá tus cortes, preguntá lo que quieras y ayudá a otros. Aaron también pasa por acá.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[34rem] animate-pulse rounded-3xl border border-line bg-surface sm:h-[38rem] lg:h-[44rem]" />}>
          <ComunidadCargada />
        </Suspense>
      </div>
    </div>
  );
}
