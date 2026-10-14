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
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    ...(esAdmin ? [{ href: "/admin", label: "Administrador", icono: "admin" }] : []),
  ];

  const activo = (href: string) => (href === "/aulas" ? pathname === "/aulas" : pathname.startsWith(href));

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-acid text-xl font-black text-acid">
          {brand
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <p className="text-sm font-black uppercase tracking-wide">{brand}</p>
        <p className="mt-1 truncate text-xs text-white/40">{email}</p>

        <div className="mt-5 text-left">
          <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
            <span>Tu progreso</span>
            <span className="text-acid">{porcentaje}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10">
            <div className="h-full bg-acid transition-all" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((it) => {
          const clase = `flex items-center gap-3 border-l-2 px-6 py-3.5 text-sm font-semibold transition ${
            activo(it.href) && !it.externo
              ? "border-acid bg-white/5 text-acid"
              : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
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

      <form action="/auth/sair" method="post" className="border-t border-white/10">
        <button className="flex w-full items-center gap-3 px-6 py-4 text-sm font-semibold text-white/50 hover:text-white">
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
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center border border-white/20 bg-black lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0b0b0b] lg:block">{contenido}</aside>

      {/* Móvil (drawer) */}
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAbierto(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#0b0b0b]">{contenido}</aside>
        </div>
      )}
    </>
  );
}
