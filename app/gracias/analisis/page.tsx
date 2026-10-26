import type { Metadata } from "next";
import PaginaEstado from "@/components/PaginaEstado";

export const metadata: Metadata = { title: "Tu pago está en análisis", robots: { index: false } };

export default function PagoEnAnalisisPage() {
  return (
    <PaginaEstado
      etiqueta="Pago en análisis"
      titulo={
        <>
          Estamos confirmando <span className="texto-luz">tu pago.</span>
        </>
      }
      intro="Tu pago está siendo revisado por el medio de pago. No hace falta que hagas nada más: apenas se apruebe, te enviamos tu acceso por email."
      pasos={[
        { t: "Esperá la confirmación", d: "La revisión la hace el medio de pago. Te avisamos por email apenas se apruebe." },
        { t: "Revisá tu email", d: "Te llega un correo con tu acceso. Si no aparece, mirá en spam o promociones." },
        { t: "Entrá con el mismo email", d: "Usá siempre el email con el que hiciste la compra para que se abra tu acceso." },
      ]}
    />
  );
}
