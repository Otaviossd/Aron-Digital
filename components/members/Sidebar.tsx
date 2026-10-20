"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  brand: string;
  email: string;
  porcentaje: number;
  esAdmin: boolean;
  instagramUrl?: string;
  soporteEmail?: string;
};

const iconos: Record<string, string> = {
  inicio: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11z",
  cuenta: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 10a8 8 0 0 1 16 0",
  soporte: "M4 4h16v12H7l-3 3V4z",
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

export default function Sidebar({ brand, email, porcentaje, esAdmin, instagramUrl, soporteEmail }: Props) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const items: { href: string; label: string; icono: string; externo?: boolean }[] = [
    { href: "/aulas", label: "Inicio", icono: "inicio" },
    { href: "/aulas/cuenta", label: "Mi cuenta", icono: "cuenta" },
    ...(soporteEmail ? [{ href: `mailto:${soporteEmail}`, label: "Soporte", icono: "soporte", externo: true }] : []),
    ...(instagramUrl ? [{ href: instagramUrl, label: "Instagram", icono: "instagram", externo: true }] : []),
    ...(esAdmin ? [{ href: "/admin", label: "Panel del equipo", icono: "admin" }] : []),
  ];

  const activo = (href: string) => (href === "/aulas" ? pathname === "/aulas" : pathname.startsWith(href));

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <p className="text-sm font-semibold tracking-tight">{brand}</p>

        <div className="mt-8">
          <p className="truncate text-xs text-faint">{email}</p>
          <div className="mt-4 flex items-baseline justify-between text-xs">
            <span className="text-muted">Tu progreso</span>
            <span className="font-medium text-accent">{porcentaje}%</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((it) => {
          const clase = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            activo(it.href) && !it.externo ? "bg-white/[0.07] font-medium text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink"
          }`;
          return it.externo ? (
            <a key={it.label} href={it.href} target="_blank" rel="noreferrer" className={clase}>
              <Icono d={iconos[it.icono]} /> {it.label}
            </a>
          ) : (
            <Link key={it.label} href={it.href} onClick={() => setAbierto(false)} className={clase}>
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
      {/* Botón móvil */}
      <button
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-bg/90 backdrop-blur lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-bg lg:block">{contenido}</aside>

      {/* Móvil (drawer) */}
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAbierto(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-bg">{contenido}</aside>
        </div>
      )}
    </>
  );
}
