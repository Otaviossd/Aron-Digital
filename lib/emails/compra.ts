// Texto del e-mail de confirmación de compra (español). Fica separado para o painel poder mostrar a prévia.
import { SOPORTE_EMAIL, DIAS_BONO, DIAS_REEMBOLSO } from "@/lib/config";
import { bloque, boton, COLORES, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout";

type Datos = { accessLink: string; loginLink: string; to: string; codigo?: string; plan?: "monthly" | "annual" | "lifetime" };

export const ASUNTO_COMPRA = "Compra confirmada: ¡bienvenido a La Nueva Ola Academy!";

const NOMBRE_PLAN = { lifetime: "Acceso vitalicio", annual: "Acceso por 1 año", monthly: "Acceso mensual" } as const;

export function htmlCompra({ accessLink, loginLink, to, plan, codigo }: Datos) {
  const enlace = (u: string, t: string) => `<a href="${u}" style="color:${COLORES.acento};text-decoration:underline">${t}</a>`;
  const detallePlan = plan
    ? `<strong style="color:#ffffff">Tu plan:</strong> ${NOMBRE_PLAN[plan]}<br/>`
    : "";

  return layoutEmail({
    preheader: "Tu acceso ya está activo. Entrá con un solo clic.",
    cuerpo: `
      ${titulo("¡Bienvenido a La Nueva Ola Academy!")}
      ${parrafo("Tu compra fue confirmada y tu acceso ya está activo. Gracias por confiar en Aaron para llevar tu barbería al siguiente nivel.")}
      ${boton(accessLink, "Entrar al curso")}
      ${bloque(`${detallePlan}<strong style="color:#ffffff">Tu cuenta:</strong> ${to}<br/><strong style="color:#ffffff">Pago:</strong> único, sin cobros recurrentes`)}

      ${subtitulo("Cómo empezar")}
      ${paso(1, "Tocá el botón de arriba: entrás con un solo clic.")}
      ${paso(2, "Empezá por el <strong>Módulo 1</strong> y seguí el orden de las clases.")}
      ${paso(3, `Los <strong>bonos</strong> y algunos módulos se abren solos a los ${DIAS_BONO} días de tu compra.`)}

      ${subtitulo("Si el botón venció")}
      ${codigo ? bloque(`<strong style="color:#ffffff">Tu código de acceso:</strong><br/><span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#ffffff">${codigo}</span><br/><span style="color:#b9c0c3">Escribilo en ${enlace(loginLink, loginLink)} si preferís no usar el botón.</span>`) : ""}
      ${parrafo(`El botón es de un solo uso y vence en poco tiempo. Podés entrar siempre desde ${enlace(loginLink, loginLink)}: escribís este mismo email (${to}) y te enviamos un acceso nuevo.`)}

      ${subtitulo("Garantía y soporte")}
      ${parrafo(`Tenés <strong>${DIAS_REEMBOLSO} días</strong> para pedir el reembolso si el curso no es para vos. ¿Alguna duda? Escribinos a ${enlace(`mailto:${SOPORTE_EMAIL}`, SOPORTE_EMAIL)} y te respondemos.`)}`,
  });
}
