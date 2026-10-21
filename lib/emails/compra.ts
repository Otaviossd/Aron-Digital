// Texto del e-mail de confirmación de compra (español). Fica separado para o painel poder mostrar a prévia.
import { boton, layoutEmail, parrafo, titulo } from "./layout";

type Datos = { accessLink: string; loginLink: string; to: string };

export const ASUNTO_COMPRA = "Compra confirmada: tu acceso al curso";

export function htmlCompra({ accessLink, loginLink, to }: Datos) {
  return layoutEmail({
    preheader: "Tu acceso ya está activo. Entrá con un solo clic.",
    cuerpo: `
      ${titulo("¡Compra confirmada!")}
      ${parrafo("Gracias por sumarte. Tu acceso ya está activo.")}
      ${boton(accessLink, "Entrar al curso")}
      ${parrafo(`Este botón entra con un solo clic y vence en poco tiempo. Si venció, entrá siempre desde <a href="${loginLink}" style="color:#39ff7e">${loginLink}</a> con este mismo email (${to}) o con Google.`)}
      ${parrafo("Algunos módulos y los bonos se liberan automáticamente a los 7 días de tu compra. Tu pago es único, sin cobros recurrentes. El reembolso está disponible durante los primeros 7 días.")}`,
  });
}
