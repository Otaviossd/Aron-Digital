// E-mail de boas-vindas da lista de espera (página /captura). Espanhol, sem promessas que não podemos cumprir.
import { PRECOS } from "../config.ts";
import { bloque, boton, layoutEmail, parrafo, titulo } from "./layout.ts";

export const ASUNTO_LISTA = "Estás en la lista: abrimos el martes 17 de noviembre";

const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;

type Datos = { whatsappUrl: string; bajaUrl: string; marca: string };

export function htmlLista({ whatsappUrl, bajaUrl, marca }: Datos) {
  return layoutEmail({
    preheader: "Abrimos el martes 17 de noviembre. Entrás primero, con 50% OFF.",
    cuerpo: `
      ${titulo("¡Listo, estás en la lista!")}
      ${parrafo(`Gracias por anotarte. Abrimos las inscripciones a la nueva plataforma de ${marca} el ${fuerte("martes 17 de noviembre, a las 17:00")} (hora de Paraguay), y vos entrás antes que el resto.`)}
      ${bloque(`${fuerte("50% de descuento + acceso vitalicio")}<br/>Solo para los primeros ${PRECOS.promo.vagas} que compren. Pagás una sola vez y el curso es tuyo para siempre.`)}
      ${parrafo("Entrá también al grupo de WhatsApp: ahí avisamos todo primero. Y en los próximos días te escribimos con lo que necesitás saber antes de la apertura.")}
      ${boton(whatsappUrl, "Entrar al grupo de WhatsApp")}`,
    pie: `Recibís este email porque lo dejaste en la página de ${marca}. <a href="${bajaUrl}" style="color:#7d878b">Darme de baja</a>`,
  });
}
