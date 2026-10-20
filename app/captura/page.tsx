import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import FormCaptura from "@/components/FormCaptura";
import NavAcceso from "@/components/NavAcceso";
import Rastreo from "@/components/Rastreo";
import { BRAND } from "@/lib/config";
import { FOTOS, fondoFoto } from "@/lib/fotos";

export const metadata: Metadata = {
  title: "El curso de Aaron abre pronto | Lista de espera",
  description: "Dejá tu email y te avisamos primero cuando abran las inscripciones al curso de barbería de Aaron Dalla Rosa.",
};

const acceder = (
  <Link href="/entrar" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-white/5">
    Acceder
  </Link>
);

export default function CapturaPage() {
  return (
    <main
      className="relative isolate flex min-h-screen flex-col"
      style={fondoFoto(FOTOS.captura, "linear-gradient(90deg, rgba(10,10,10,.94) 0%, rgba(10,10,10,.7) 55%, rgba(10,10,10,.35) 100%)")}
    >
      <Rastreo path="/captura" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_0%,rgba(205,180,138,.14),transparent)]" />

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight">{BRAND}</span>
        <Suspense fallback={acceder}>
          <NavAcceso />
        </Suspense>
      </nav>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24 pt-10">
        <p className="mb-6 text-sm font-medium text-accent">Lista de espera</p>
        <h1 className="max-w-3xl text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
          El curso de Aaron <span className="text-ink/55">abre pronto.</span>
        </h1>
        <p className="mb-10 mt-7 max-w-xl text-lg leading-relaxed text-muted">
          Dejá tu email y te avisamos primero cuando abran las inscripciones. Barbería de verdad, con Aaron Dalla Rosa,
          clases nuevas cada semana.
        </p>
        <FormCaptura />
      </section>
    </main>
  );
}
