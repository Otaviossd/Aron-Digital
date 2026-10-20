// Texto do e-mail de confirmação de compra (espanhol). Fica separado para o painel poder mostrar a prévia.

type Datos = { accessLink: string; loginLink: string; to: string };

export const ASUNTO_COMPRA = "Compra confirmada: tu acceso al curso";

export function htmlCompra({ accessLink, loginLink, to }: Datos) {
  return `
      <div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;line-height:1.55">
        <h1 style="font-size:24px;margin:0 0 12px">¡Compra confirmada!</h1>
        <p>Gracias por sumarte. Tu acceso ya está activo.</p>
        <p style="margin:24px 0">
          <a href="${accessLink}" style="background:#111;color:#fff;padding:14px 26px;font-weight:600;border-radius:999px;text-decoration:none;display:inline-block">
            Entrar al curso
          </a>
        </p>
        <p style="font-size:14px;color:#444">
          Este botón entra con un solo clic y vence en poco tiempo. Si venció, entrá siempre desde
          <a href="${loginLink}">${loginLink}</a> con este mismo email (${to}) o con Google.
        </p>
        <p style="font-size:14px;color:#444">
          Algunos módulos se liberan automáticamente a los 7 días de tu compra. Podés cancelar la
          suscripción cuando quieras desde tu cuenta; el reembolso solo está disponible durante los
          primeros 7 días.
        </p>
      </div>`;
}
