import { FOTOS } from "@/lib/fotos";

// Video de la página de ventas. Se activa solo cuando existe NEXT_PUBLIC_VIDEO_VENTAS en la Vercel:
// - un archivo .mp4 (por ejemplo, subido a Supabase Storage) se muestra con el reproductor del navegador
// - una URL de YouTube/Vimeo "embed" se muestra dentro de un iframe
// Sin variable, no se muestra nada.
export default function VideoVentas() {
  const url = process.env.NEXT_PUBLIC_VIDEO_VENTAS?.trim();
  if (!url) return null;
  const esArchivo = /\.(mp4|webm)(\?|$)/i.test(url);

  return (
    <section className="mx-auto max-w-4xl px-6 pb-20">
      <div className="cristal overflow-hidden rounded-3xl p-2">
        {esArchivo ? (
          <video src={url} poster={FOTOS.portada} controls playsInline preload="none" className="aspect-video w-full rounded-2xl bg-black" />
        ) : (
          <iframe src={url} title="Video del curso" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" className="aspect-video w-full rounded-2xl bg-black" />
        )}
      </div>
    </section>
  );
}
