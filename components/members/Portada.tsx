import Link from "next/link";
import { FOTOS } from "@/lib/fotos";
import { ui } from "@/lib/ui";

type Props = {
  titulo?: string;
  modulo?: string;
  href?: string;
  empezando: boolean;
  aviso?: string;
};

// Portada de la home del alumno.
// Móvil: la foto se ve entera (16:9, sin recortar) y el texto va debajo.
// Escritorio: el texto se superpone sobre la foto.
export default function Portada({ titulo, modulo, href, empezando, aviso }: Props) {
  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#07090a] sm:mb-14 md:rounded-3xl">
      <div
        aria-hidden="true"
        className="relative aspect-video w-full bg-cover bg-center md:absolute md:inset-0 md:aspect-auto md:bg-[position:75%_center]"
        style={{ backgroundImage: `url(${FOTOS.portada})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090a] via-transparent to-transparent md:via-[#07090a]/50" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#07090a]/75 via-transparent to-transparent md:block" />
      </div>

      <div className="relative -mt-10 flex flex-col justify-end px-5 pb-6 md:mt-0 md:aspect-[16/8] md:max-w-xl md:p-10">
        {href ? (
          <>
            <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-black/40 px-3 py-1.5 text-xs font-medium text-accent backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(57,255,126,.9)]" />
              {empezando ? "Empezá acá" : "Seguí donde quedaste"}
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-[1.12] tracking-tight md:text-4xl">{titulo}</h1>
            <p className="mt-1.5 text-sm text-muted">{modulo}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href={href} className={`${ui.boton} w-full sm:w-auto`}>
                {empezando ? "Ver primera clase" : "Continuar"}
              </Link>
              {aviso && <span className="cristal rounded-full px-4 py-2.5 text-xs text-muted">{aviso}</span>}
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm font-medium text-accent">Al día</p>
            <h1 className="text-balance text-2xl font-semibold leading-[1.12] tracking-tight md:text-4xl">Completaste todo lo disponible</h1>
            <p className="mt-2 text-sm text-muted">Volvé pronto: se publican clases nuevas cada semana.</p>
          </>
        )}
      </div>
    </section>
  );
}
