import { Suspense } from "react";
import Link from "next/link";
import { getMemberData, siguienteAula } from "@/lib/members";
import { fechaLarga, textoHoras } from "@/lib/certificado";
import { siteUrl } from "@/lib/site";
import { ui } from "@/lib/ui";
import FormCertificado from "@/components/members/FormCertificado";
import BotonCopiar from "@/components/members/BotonCopiar";
import EnlacePdf from "@/components/members/EnlacePdf";

export default function CertificadoPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-white/[0.03]" />}>
      <Certificado />
    </Suspense>
  );
}

async function Certificado() {
  const { supabase, email, esAdmin, progreso, porcentaje, modulos, aulas, completadas, nombre, tieneNombre } = await getMemberData();

  if (!progreso) {
    return (
      <Cabecera>
        <p className="rounded-2xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
          El certificado se está activando. Volvé en unos minutos.
        </p>
      </Cabecera>
    );
  }

  const { data: cert } = await supabase
    .from("certificados")
    .select("nombre_completo, codigo, emitido_at, horas, clases")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  // Con el certificado ya emitido
  if (cert) {
    const url = `${siteUrl()}/verificar/${cert.codigo}`;
    const texto = encodeURIComponent(`Terminé el curso de La Nueva Ola Academy 💈 Mi certificado: ${url}`);
    return (
      <Cabecera titulo="Tu certificado" subtitulo="Lo lograste. Descargalo, compartilo y mostralo con orgullo.">
        <div className="entra relative overflow-hidden rounded-3xl border border-accent/30 bg-[#07090a] p-7 text-center shadow-[0_30px_90px_-30px_rgba(57,255,126,0.35)] sm:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.16] blur-[90px]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">La Nueva Ola Academy</p>
          <h2 className="mt-4 text-2xl font-semibold uppercase tracking-[0.14em] sm:text-3xl">Certificado de conclusión</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-accent" />
          <p className="mt-8 text-sm text-muted">Se certifica que</p>
          <p className="mt-2 font-serif text-4xl font-bold italic leading-tight sm:text-5xl">{cert.nombre_completo}</p>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted">
            completó el 100 % de las clases del curso de barbería digital La Nueva Ola Academy, dictado por Aaron Dalla Rosa, con una carga de formación de {textoHoras(Number(cert.horas))} en {cert.clases} clases en video.
          </p>
          <p className="mt-6 text-xs text-faint">
            Emitido el {fechaLarga(cert.emitido_at)} · Código <span className="font-mono text-accent">{cert.codigo}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <EnlacePdf className={ui.boton}>Descargar PDF</EnlacePdf>
          <a href={`https://wa.me/?text=${texto}`} target="_blank" rel="noreferrer" className={ui.botonSuave}>
            Compartir por WhatsApp
          </a>
          <BotonCopiar texto={url} etiqueta="Copiar enlace de verificación" className={ui.botonSuave} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Cualquier persona puede comprobar que tu certificado es auténtico escaneando el QR del PDF o entrando a {url.replace(/^https?:\/\//, "")}.
        </p>

        <details className="mt-8 rounded-2xl border border-line bg-surface p-5">
          <summary className="cursor-pointer text-sm font-medium text-muted transition hover:text-ink">¿Hay un error en tu nombre? Corregilo</summary>
          <div className="mt-4">
            <FormCertificado nombre={cert.nombre_completo} etiqueta="Guardar y actualizar el PDF" />
          </div>
        </details>
      </Cabecera>
    );
  }

  // Curso completo, falta pedir el nombre
  if (progreso.elegible) {
    return (
      <Cabecera titulo="¡Terminaste el curso! 🎉" subtitulo="Completaste el 100 % de las clases. Tu certificado está desbloqueado.">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-surface p-6 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/[0.16] blur-[80px]" />
          <p className="mb-5 text-sm leading-relaxed text-muted">
            Escribí tu nombre completo y generamos tu certificado en PDF, firmado por Aaron Dalla Rosa, con un código único para que cualquiera pueda verificarlo.
          </p>
          <FormCertificado nombre={tieneNombre ? nombre : ""} etiqueta="Generar mi certificado" nota="Revisalo bien: aparece tal cual en el PDF (podés corregirlo después)." />
        </div>
        {esAdmin && (
          <p className="mt-4 text-xs text-faint">
              Equipo: <EnlacePdf demo className="text-accent underline-offset-2 hover:underline">ver PDF de ejemplo</EnlacePdf>
          </p>
        )}
      </Cabecera>
    );
  }

  // Todavía no terminó: muestra cuánto falta
  const faltan = progreso.total - progreso.hechas;
  const siguiente = siguienteAula(modulos, aulas, completadas);
  const radio = 54;
  const circ = 2 * Math.PI * radio;
  return (
    <Cabecera titulo="Tu certificado" subtitulo="Se desbloquea cuando completás el 100 % de las clases del curso.">
      <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-[auto_1fr] sm:p-9">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={radio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="64" cy="64" r={radio} fill="none" stroke="#39ff7e" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - porcentaje / 100)} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)", filter: "drop-shadow(0 0 8px rgba(57,255,126,.6))" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular-nums">{porcentaje}%</span>
            <span className="text-[11px] text-faint">completado</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">
            {faltan === 1 ? "Te falta 1 clase" : `Te faltan ${faltan} clases`} para tu certificado
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Llevás {progreso.hechas} de {progreso.total} clases. Cuando completes la última, escribís tu nombre y descargás tu certificado en PDF, firmado por Aaron y verificable online.
          </p>
          {siguiente && (
            <Link href={`/aulas/${siguiente.aula.id}`} className={`${ui.boton} mt-5`}>
              Seguir con: {siguiente.aula.title}
            </Link>
          )}
        </div>
      </div>
      {esAdmin && (
        <p className="mt-4 text-xs text-faint">
          Equipo: <EnlacePdf demo className="text-accent underline-offset-2 hover:underline">ver PDF de ejemplo</EnlacePdf>
        </p>
      )}
    </Cabecera>
  );
}

function Cabecera({ titulo = "Certificado", subtitulo, children }: { titulo?: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className={ui.etiqueta}>Certificado</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{titulo}</h1>
      {subtitulo && <p className="mt-2 max-w-xl text-muted">{subtitulo}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
