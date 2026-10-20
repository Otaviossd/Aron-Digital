import { Suspense } from "react";
import { ui } from "@/lib/ui";

export default function BajaPage(props: PageProps<"/baja">) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <Contenido searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: { searchParams: Promise<{ t?: string; ok?: string; error?: string }> }) {
  const sp = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md">
        {sp.ok ? (
          <>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight">Listo, te dimos de baja.</h1>
            <p className="leading-relaxed text-muted">
              No vas a recibir más emails promocionales. Si ya sos alumno, seguís recibiendo los avisos de tu cuenta.
            </p>
          </>
        ) : sp.error || !sp.t ? (
          <>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight">Enlace no válido</h1>
            <p className="leading-relaxed text-muted">
              No pudimos procesar la baja. Respondé a cualquiera de nuestros emails y lo hacemos a mano.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight">¿Querés darte de baja?</h1>
            <p className="mb-7 leading-relaxed text-muted">Dejaremos de enviarte emails promocionales.</p>
            <form action="/api/baja" method="post">
              <input type="hidden" name="t" value={sp.t} />
              <button className={ui.boton}>Confirmar baja</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
