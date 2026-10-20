import { SOPORTE_EMAIL } from "@/lib/config";
import { ui } from "@/lib/ui";
import Link from "next/link";

export const metadata = { title: "Soporte" };

export default function SoportePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">Soporte</h1>
      <p className="mb-8 leading-relaxed text-muted">
        ¿Algo no funciona o tenés una duda sobre tu acceso, tu pago o una clase? Escribinos y te ayudamos.
      </p>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="text-xs text-faint">Escribinos a</p>
        <a href={`mailto:${SOPORTE_EMAIL}`} className="mt-1 block break-all text-lg font-medium tracking-tight text-ink transition hover:text-accent">
          {SOPORTE_EMAIL}
        </a>
        <a href={`mailto:${SOPORTE_EMAIL}`} className={`${ui.boton} mt-6`}>
          Enviar un email
        </a>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface/60 p-6 text-sm leading-relaxed text-muted">
        <p className="mb-2 font-medium text-ink">Para ayudarte más rápido, incluí en el mensaje:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>El email con el que entrás al curso.</li>
          <li>Qué estabas intentando hacer y qué pasó.</li>
          <li>Una captura de pantalla, si podés.</li>
        </ul>
        <p className="mt-4">
          Antes de escribir, mirá las{" "}
          <Link href="/aulas/ayuda" className="text-accent underline-offset-4 hover:underline">
            preguntas frecuentes
          </Link>
          : tal vez la respuesta ya está ahí.
        </p>
      </div>
    </div>
  );
}
