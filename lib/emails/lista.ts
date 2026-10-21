// E-mail de boas-vindas da lista de espera (página /captura). Espanhol, sem promessas que não podemos cumprir.
import { boton, layoutEmail, parrafo, titulo } from "./layout";

export const ASUNTO_LISTA = "Estás en la lista";

type Datos = { whatsappUrl: string; bajaUrl: string; marca: string };

export function htmlLista({ whatsappUrl, bajaUrl, marca }: Datos) {
  return layoutEmail({
    preheader: "Entrás primero y te llevás un descuento exclusivo.",
    cuerpo: `
      ${titulo("¡Listo, estás en la lista!")}
      ${parrafo(`Te vamos a avisar por email apenas abramos las inscripciones a la nueva plataforma de ${marca}, y vas a entrar antes que el resto.`)}
      ${parrafo("Para quedarte con el descuento exclusivo de la lista de espera, entrá también al grupo de WhatsApp: ahí avisamos todo primero.")}
      ${boton(whatsappUrl, "Entrar al grupo de WhatsApp")}`,
    pie: `Recibís este email porque lo dejaste en la página de ${marca}. <a href="${bajaUrl}" style="color:#6f787c">Darme de baja</a>`,
  });
}
