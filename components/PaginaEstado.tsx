import type { ReactNode } from "react";
import Link from "next/link";
import { BRAND, SOPORTE_EMAIL, WHATSAPP_ALUMNOS_URL } from "@/lib/config";
import { FOTOS } from "@/lib/fotos";
import { ui } from "@/lib/ui";

type Props = {
  etiqueta: string;
  titulo: ReactNode;
  intro: string;
  pasos: { t: string; d: string }[];
};

// Página de agradecimiento para compras que todavía no están aprobadas (pago pendiente o en análisis).
export default function PaginaEstado({ etiqueta, titulo, intro, pasos }: Props) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="rejilla absolute inset-0" />
        <div className="respirar absolute -right-24 -top-10 h-[34rem] w-[34rem] rounded-full bg-accent/30 blur-[140px]" />
        <div className="respirar absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[130px] [animation-delay:-3s]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-6">
        <p className="text-sm font-semibold tracking-tight">{BRAND}</p>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_.9fr]">
          <div className="cristal relative overflow-hidden rounded-3xl p-7 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent shadow-[0_0_40px_-8px_rgba(57,255,126,.8)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <p className="text-sm font-medium text-accent">{etiqueta}</p>
            <h1 className="mt-2 text-[clamp(2rem,4.6vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.03em]">{titulo}</h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted">{intro}</p>

            <ol className="mt-8 space-y-4">
              {pasos.map((p, i) => (
                <li key={p.t} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">{i + 1}</span>
                  <div>
                    <p className="font-medium tracking-tight">{p.t}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={WHATSAPP_ALUMNOS_URL} target="_blank" rel="noreferrer" className={`${ui.boton} w-full sm:w-auto`}>
                Entrar al grupo de alumnos
              </a>
              <Link href="/entrar" className={`${ui.botonSuave} w-full sm:w-auto`}>
                Ya pagué, quiero entrar
              </Link>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-faint">
              ¿Alguna duda con tu pago? Escribinos a{" "}
              <a href={`mailto:${SOPORTE_EMAIL}`} className="text-muted underline underline-offset-4 hover:text-ink">
                {SOPORTE_EMAIL}
              </a>
              .
            </p>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div aria-hidden="true" className="respirar absolute left-1/2 top-[42%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(57,255,126,.45),rgba(57,255,126,.15)_50%,transparent)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOTOS.retratoRecorte} alt="Aaron Dalla Rosa" width={900} height={1500} className="foto-fundida relative z-10 mx-auto h-auto max-h-[36rem] w-auto max-w-full object-contain" />
          </div>
        </div>
      </div>
    </main>
  );
}
