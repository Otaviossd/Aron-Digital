import Link from "next/link";
import { DIAS_BONO, DIAS_REEMBOLSO } from "@/lib/config";

export const metadata = { title: "Preguntas frecuentes" };

const PREGUNTAS = [
  {
    q: "¿Cómo entro al curso?",
    r: "Entrá con el mismo email con el que compraste. Te enviamos un enlace de acceso por email (no necesitás contraseña). Si compraste con otro email, cerrá sesión y entrá con ese.",
  },
  {
    q: "No me llega el email de acceso, ¿qué hago?",
    r: "Revisá la carpeta de spam o promociones y esperá un par de minutos. Si sigue sin llegar, pedí un enlace nuevo desde la pantalla de acceso o escribinos a soporte.",
  },
  {
    q: "¿Por qué algunos módulos tienen candado?",
    r: "Los módulos se liberan solos con el tiempo, a partir del día de tu compra, para que avances en orden. Cada candado te muestra cuántos días faltan.",
  },
  {
    q: "¿Cuándo se abren los bonos?",
    r: `Los bonos (por ejemplo, el módulo de Color) y algunas clases se liberan ${DIAS_BONO} días después de tu acceso. Los vas a ver en la fila “Bonos” con el tiempo que falta.`,
  },
  {
    q: "¿Se suben clases nuevas?",
    r: "Sí. La plataforma crece con clases nuevas, que aparecen en tu panel apenas se publican.",
  },
  {
    q: "¿Puedo ver el curso desde el celular?",
    r: "Sí. Funciona desde el celular, la tablet y la computadora. Entrás con tu email y seguís donde te quedaste.",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    r: "Entrá a “Mi cuenta” y tocá “Cancelar suscripción”. Mantenés el acceso hasta el fin del período que ya pagaste.",
  },
  {
    q: "¿Puedo pedir reembolso?",
    r: `Sí, tenés ${DIAS_REEMBOLSO} días desde la compra. Escribinos a soporte dentro de ese plazo y lo gestionamos.`,
  },
  {
    q: "¿Cómo cambio mi foto de perfil?",
    r: "Entrá a “Mi cuenta” y tocá “Subir foto”. Podés cambiarla o quitarla cuando quieras.",
  },
];

export default function AyudaPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">Preguntas frecuentes</h1>
      <p className="mb-8 text-muted">Las dudas más comunes sobre tu acceso y el curso.</p>

      <div className="space-y-3">
        {PREGUNTAS.map((p) => (
          <details key={p.q} className="group rounded-2xl border border-line bg-surface transition open:border-line-strong">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium">
              {p.q}
              <span className="text-lg leading-none text-faint transition group-open:rotate-45">+</span>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{p.r}</p>
          </details>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted">
        ¿No encontraste tu respuesta?{" "}
        <Link href="/aulas/soporte" className="text-accent underline-offset-4 hover:underline">
          Escribinos a soporte
        </Link>
        .
      </p>
    </div>
  );
}
