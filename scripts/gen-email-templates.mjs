// Genera las plantillas de email de Supabase Auth con el mismo molde visual del sitio.
// Uso: node scripts/gen-email-templates.mjs   (escribe en supabase/email-templates/)
import { writeFileSync } from "node:fs";
import { boton, layoutEmail, parrafo, titulo } from "../lib/emails/layout.ts";

const SITE = "https://lanuevaolaacademy.com";

const acceso = (tit, intro, textoBoton) =>
  layoutEmail({
    siteUrl: SITE,
    preheader: "Tu enlace de acceso, válido por poco tiempo.",
    cuerpo: `${titulo(tit)}${parrafo(intro)}${boton("{{ .ConfirmationURL }}", textoBoton)}${parrafo(
      "Este enlace vence en poco tiempo y solo se puede usar una vez. Si no lo pediste vos, ignorá este email.",
    )}`,
    pie: "Recibís este email porque alguien pidió entrar a La Nueva Ola Academy con esta dirección.",
  });

const out = {
  "magic-link": acceso("Tu enlace de acceso", "Tocá el botón para entrar a tu curso. No necesitás contraseña.", "Entrar al curso"),
  "confirm-signup": acceso("Confirmá tu email", "Tocá el botón para confirmar tu email y entrar a tu curso.", "Confirmar y entrar"),
};
for (const [nombre, html] of Object.entries(out)) writeFileSync(new URL(`../supabase/email-templates/${nombre}.html`, import.meta.url), html);
console.log("Plantillas generadas:", Object.keys(out).join(", "));
