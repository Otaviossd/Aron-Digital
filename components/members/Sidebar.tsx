"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";

type Props = {
  brand: string;
  email: string;
  porcentaje: number;
  esAdmin: boolean;
  vistaAlumno?: boolean;
  avatarUrl?: string | null;
  instagramUrl?: string;
  whatsappUrl?: string;
};

const iconos: Record<string, string> = {
  inicio: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11z",
  cuenta: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 10a8 8 0 0 1 16 0",
  soporte: "M4 4h16v12H7l-3 3V4z",
  ayuda: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01",
  whatsapp: "M4 20l1.3-4.2A8 8 0 1 1 8.3 18.8L4 20zM9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2L9 9z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  admin: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z",
  salir: "M10 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5M16 17l5-5-5-5M21 12H9",
};

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Sidebar({ brand, email, porcentaje, esAdmin, vistaAlumno, avatarUrl, instagramUrl, whatsappUrl }: Props) {
  const pathname = usePathname();
  // Menú móvil sin depender de JavaScript para abrir: un checkbox oculto + CSS (abre al instante, incluso antes de hidratar).
  const casilla = useRef<HTMLInputElement>(null);
  const cerrar = () => {
    if (casilla.current) casilla.current.checked = false;
  };
  useEffect(cerrar, [pathname]);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const items: { href: string; label: string; icono: string; externo?: boolean; recarga?: boolean }[] = [
    { href: "/aulas", label: "Inicio", icono: "inicio" },
    { href: "/aulas/cuenta", label: "Mi cuenta", icono: "cuenta" },
    { href: "/aulas/ayuda", label: "Preguntas frecuentes", icono: "ayuda" },
    { href: "/aulas/soporte", label: "Soporte", icono: "soporte" },
    ...(whatsappUrl ? [{ href: whatsappUrl, label: "Grupo de WhatsApp", icono: "whatsapp", externo: true }] : []),
    ...(instagramUrl ? [{ href: instagramUrl, label: "Instagram", icono: "instagram", externo: true }] : []),
    ...(esAdmin ? [{ href: "/admin", label: "Panel del equipo", icono: "admin" }] : []),
    ...(esAdmin
      ? [
          vistaAlumno
            ? { href: "/aulas/vista", label: "Salir de vista alumno", icono: "ayuda", externo: false, recarga: true }
            : { href: "/aulas/vista?modo=nuevo", label: "Ver como alumno nuevo", icono: "ayuda", externo: false, recarga: true },
        ]
      : []),
  ];

  const activo = (href: string) => (href === "/aulas" ? pathname === "/aulas" : pathname.startsWith(href));

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <p className="text-sm font-semibold tracking-tight">{brand}</p>

        <div className="mt-8">
          <Link href="/aulas/cuenta" onClick={() => cerrar()} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-3 transition hover:border-line-strong">
            <Avatar url={avatarUrl} email={email} size={36} />
            <span className="min-w-0">
              <span className="block text-[11px] text-faint">Tu cuenta</span>
              <span className="block truncate text-xs text-ink/90">{email}</span>
            </span>
          </Link>
          <div className="mt-5 flex items-baseline justify-between text-xs">
            <span className="text-muted">Tu progreso</span>
            <span className="font-medium text-accent">{porcentaje}%</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-[#b6ff5c] shadow-[0_0_12px_rgba(57,255,126,.7)] transition-all" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((it) => {
          const clase = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            activo(it.href) && !it.externo ? "bg-accent/10 font-medium text-ink shadow-[inset_2px_0_0_#39ff7e]" : "text-muted hover:bg-white/[0.04] hover:text-ink"
          }`;
          return it.recarga ? (
            <a key={it.label} href={it.href} className={clase}>
              <Icono d={iconos[it.icono]} /> {it.label}
            </a>
          ) : it.externo ? (
            <a key={it.label} href={it.href} target="_blank" rel="noreferrer" className={clase}>
              <Icono d={iconos[it.icono]} /> {it.label}
            </a>
          ) : (
            <Link key={it.label} href={it.href} onClick={() => cerrar()} className={clase}>
              <Icono d={iconos[it.icono]} /> {it.label}
            </Link>
          );
        })}
      </nav>

      <form action="/auth/sair" method="post" className="border-t border-line p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-faint transition hover:bg-white/[0.04] hover:text-ink">
          <Icono d={iconos.salir} /> Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <>
      <input ref={casilla} id="menu-movil" type="checkbox" className="peer sr-only" tabIndex={-1} aria-hidden="true" />
      <label htmlFor="menu-movil" role="button" aria-label="Abrir menú" className="fixed left-3 top-2.5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-bg/90 backdrop-blur lg:hidden cursor-pointer">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </label>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 border-r border-line bg-bg/80 backdrop-blur-xl lg:block">{contenido}</aside>
      <label htmlFor="menu-movil" aria-label="Cerrar menú" className="fixed inset-0 z-40 hidden bg-black/70 peer-checked:block lg:!hidden" />
      <aside className="invisible fixed inset-y-0 left-0 z-50 w-[17rem] max-w-[85vw] -translate-x-full border-r border-line bg-bg shadow-2xl transition-[transform,visibility] duration-200 peer-checked:visible peer-checked:translate-x-0 lg:hidden">
        {contenido}
      </aside>
    </>
  );
}
