"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEnVivo } from "@/components/live/LiveProvider";

const items = [
  { href: "/aulas", label: "Inicio", d: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11z" },
  { href: "/aulas/live", label: "En vivo", d: "M3 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3V7zm14 3l4-2v8l-4-2", vivo: true },
  { href: "/aulas/comunidad", label: "Comunidad", d: "M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm11 10v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8" },
  { href: "/aulas/certificado", label: "Certificado", d: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-3.5-.5L7 22l5-3 5 3-1.5-7.5" },
  { href: "/aulas/cuenta", label: "Cuenta", d: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 10a8 8 0 0 1 16 0" },
];

// Barra de pestañas fija abajo en el celular, como una app.
export default function BarraInferior() {
  const pathname = usePathname();
  const { enVivo } = useEnVivo();
  const activo = (href: string) => (href === "/aulas" ? pathname === "/aulas" : pathname.startsWith(href));
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} aria-current={activo(it.href) ? "page" : undefined} className={`relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition active:scale-90 ${activo(it.href) ? "text-accent" : "text-faint"}`}>
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={it.d} />
              </svg>
              {it.label}
              {it.vivo && enVivo && <span className="absolute right-[22%] top-2 h-2 w-2 animate-pulse rounded-full bg-[#ff3d71]" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
