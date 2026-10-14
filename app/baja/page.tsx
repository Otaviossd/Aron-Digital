import { Suspense } from "react";

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
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md">
        {sp.ok ? (
          <>
            <h1 className="mb-4 text-4xl font-black uppercase leading-none">Listo, <span className="text-acid">te dimos de baja</span></h1>
            <p className="text-white/70">No vas a recibir más emails promocionales. Si ya sos alumno, seguís recibiendo los avisos de tu cuenta.</p>
          </>
        ) : sp.error || !sp.t ? (
          <>
            <h1 className="mb-4 text-3xl font-black uppercase leading-none">Enlace no válido</h1>
            <p className="text-white/70">No pudimos procesar la baja. Respondé a cualquiera de nuestros emails y lo hacemos a mano.</p>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-4xl font-black uppercase leading-none">¿Querés <span className="text-acid">darte de baja</span>?</h1>
            <p className="mb-6 text-white/70">Dejaremos de enviarte emails promocionales.</p>
            <form action="/api/baja" method="post">
              <input type="hidden" name="t" value={sp.t} />
              <button className="border-2 border-acid bg-acid px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-transparent hover:text-acid">
                Confirmar baja
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
