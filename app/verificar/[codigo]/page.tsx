import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fechaLarga, textoHoras } from "@/lib/certificado";

export const metadata: Metadata = {
  title: "Verificar certificado · La Nueva Ola Academy",
  robots: { index: false },
};

export default function VerificarPage(props: PageProps<"/verificar/[codigo]">) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-5 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-accent/[0.18] blur-[130px]" />
      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-3xl bg-white/[0.03]" />}>
        <Resultado params={props.params} />
      </Suspense>
    </main>
  );
}

async function Resultado({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const limpio = decodeURIComponent(codigo).slice(0, 32);
  const supabase = await createClient();
  const { data } = await supabase.rpc("verificar_certificado", { p_codigo: limpio });
  const cert = (Array.isArray(data) ? data[0] : null) as { nombre_completo: string; emitido_at: string; horas: number; clases: number } | null;

  return (
    <div className="cristal relative w-full max-w-md rounded-3xl p-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">La Nueva Ola Academy</p>
      {cert ? (
        <>
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">Certificado auténtico</h1>
          <p className="mt-6 text-xs text-faint">Se certifica que</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{cert.nombre_completo}</p>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted">
            completó el 100 % de las clases del curso La Nueva Ola Academy, dictado por Aaron Dalla Rosa ({textoHoras(Number(cert.horas))} en {cert.clases} clases).
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-left text-xs">
            <div className="rounded-xl border border-line bg-white/[0.03] p-3">
              <dt className="text-faint">Emitido el</dt>
              <dd className="mt-0.5 font-medium">{fechaLarga(cert.emitido_at)}</dd>
            </div>
            <div className="rounded-xl border border-line bg-white/[0.03] p-3">
              <dt className="text-faint">Código</dt>
              <dd className="mt-0.5 font-mono font-medium text-accent">{limpio.toUpperCase()}</dd>
            </div>
          </dl>
        </>
      ) : (
        <>
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-400/15 text-red-300">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">No encontramos este certificado</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">Revisá que el código esté bien escrito. Tiene el formato LNO-XXXX-XXXX.</p>
        </>
      )}
    </div>
  );
}
