// E-mail de boas-vindas da lista de espera (página /captura). Espanhol, sem promessas que não podemos cumprir.

export const ASUNTO_LISTA = "Estás en la lista";

type Datos = { whatsappUrl: string; bajaUrl: string; marca: string };

export function htmlLista({ whatsappUrl, bajaUrl, marca }: Datos) {
  return `
  <div style="font-family:Inter,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;line-height:1.55">
    <h1 style="font-size:24px;margin:0 0 12px">¡Listo, estás en la lista!</h1>
    <p>Te vamos a avisar por email apenas abramos las inscripciones al curso de ${marca}.</p>
    <p>Mientras tanto, sumate al grupo de WhatsApp: ahí vamos a avisar las novedades.</p>
    <p style="margin:24px 0">
      <a href="${whatsappUrl}" style="background:#111;color:#fff;padding:14px 26px;font-weight:600;border-radius:999px;text-decoration:none;display:inline-block">
        Entrar al grupo de WhatsApp
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #ddd;margin:32px 0 16px" />
    <p style="font-size:12px;color:#777">
      Recibís este email porque lo dejaste en la página de ${marca}.
      <a href="${bajaUrl}" style="color:#777">Darme de baja</a>
    </p>
  </div>`;
}
