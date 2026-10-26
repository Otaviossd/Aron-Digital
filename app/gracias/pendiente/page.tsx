import type { Metadata } from "next";
import PaginaEstado from "@/components/PaginaEstado";

export const metadata: Metadata = { title: "Estamos esperando tu pago", robots: { index: false } };

export default function PagoPendientePage() {
  return (
    <PaginaEstado
      etiqueta="Pago pendiente"
      titulo={
        <>
          Tu lugar está <span className="texto-luz">reservado.</span>
        </>
      }
      intro="Ya generaste tu compra y estamos esperando que se confirme el pago. Apenas se acredite, te enviamos tu acceso por email."
      pasos={[
        { t: "Completá el pago", d: "Si elegiste pagar con transferencia, efectivo u otro medio con pago diferido, terminalo con las instrucciones que te mostró la Hotmart." },
        { t: "Revisá tu email", d: "Cuando se confirme el pago te llega un correo con tu acceso. Si no aparece, mirá en spam o promociones." },
        { t: "Entrá con el mismo email", d: "Usá siempre el email con el que hiciste la compra para que se abra tu acceso." },
      ]}
    />
  );
}
