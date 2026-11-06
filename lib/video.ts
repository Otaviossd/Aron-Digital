// Convierte los enlaces que pega el equipo (YouTube, Vimeo, archivo) en algo que se pueda incrustar.
// YouTube sirve para las clases en vivo: el mismo enlace del directo pasa a ser la grabación cuando termina.

const ID_YOUTUBE = /^[\w-]{11}$/;

function idYoutube(u: URL): string | null {
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.split("/")[1] ?? "";
    return ID_YOUTUBE.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = u.searchParams.get("v");
    if (v && ID_YOUTUBE.test(v)) return v;
    const [, tipo, id] = u.pathname.split("/");
    if (["embed", "live", "shorts", "v"].includes(tipo) && ID_YOUTUBE.test(id ?? "")) return id;
  }
  return null;
}

export function aEmbed(entrada: string | null | undefined): string | null {
  const texto = (entrada ?? "").trim();
  if (!texto) return null;
  let u: URL;
  try {
    u = new URL(texto);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const yt = idYoutube(u);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`;

  const vimeo = /^(?:www\.)?vimeo\.com$/.test(u.hostname) ? u.pathname.match(/^\/(\d+)/) : null;
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return texto;
}

export function esArchivoDeVideo(url: string | null | undefined) {
  return url ? /\.(mp4|webm|mov)(\?|$)/i.test(url) : false;
}
