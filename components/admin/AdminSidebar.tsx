"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const iconos: Record<string, string> = {
  resumen: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z",
  embudo: "M3 5h18l-7 8v6l-4-2v-4L3 5z",
  alumnos: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0",
  contenido: "M4 5h16v14H4V5zm0 5h16M9 5v14",
  email: "M3 6h18v12H3V6zm0 1l9 7 9-7",
  finanzas: "M12 3v18M16.5 7.5C15.5 6.5 14 6 12 6c-2.5 0-4 1.2-4 3s1.5 2.6 4 3 4 1.2 4 3-1.5 3-4 3c-2 0-3.5-.6-4.5-1.6",
  enlaces: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  equipo: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z",
  aluno: "M5 4l14 8-14 8V4z",
  salir: "M10 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5M16 17l5-5-5-5M21 12H9",
};

const items = [
  { href: "/admin", label: "Resumen", icono: "resumen" },
  { href: "/admin/embudo", label: "Embudo", icono: "embudo" },
  { href: "/admin/finanzas", label: "Finanzas", icono: "finanzas" },
  { href: "/admin/alumnos", label: "Alumnos", icono: "alumnos" },
  { href: "/admin/contenido", label: "Contenido", icono: "contenido" },
  { href: "/admin/email", label: "Email marketing", icono: "email" },
  { href: "/admin/enlaces", label: "Enlaces", icono: "enlaces" },
  { href: "/admin/equipo", label: "Equipo", icono: "equipo" },
];

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function AdminSidebar({ brand, email }: { brand: string; email: string }) {
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
  const activo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <p className="text-sm font-semibold tracking-tight">{brand}</p>
        <p className="mt-1 text-xs text-accent">Panel del equipo</p>
        <p className="mt-6 truncate text-xs text-faint">{email}</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => cerrar()}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              activo(it.href) ? "bg-white/[0.07] font-medium text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink"
            }`}
          >
            <Icono d={iconos[it.icono]} /> {it.label}
          </Link>
        ))}
        <div className="my-3 h-px bg-line" />
        <Link href="/aulas" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-white/[0.04] hover:text-ink">
          <Icono d={iconos.aluno} /> Ver como alumno
        </Link>
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
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-bg lg:block">{contenido}</aside>
      <label htmlFor="menu-movil" aria-label="Cerrar menú" className="fixed inset-0 z-40 hidden bg-black/70 peer-checked:block lg:!hidden" />
      <aside className="invisible fixed inset-y-0 left-0 z-50 w-[17rem] max-w-[85vw] -translate-x-full border-r border-line bg-bg shadow-2xl transition-[transform,visibility] duration-200 peer-checked:visible peer-checked:translate-x-0 lg:hidden">
        {contenido}
      </aside>
    </>
  );
}
