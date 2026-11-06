"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Estado = { enVivo: boolean; titulo: string | null };

const Contexto = createContext<Estado>({ enVivo: false, titulo: null });
export const useEnVivo = () => useContext(Contexto);

// Sabe si hay una clase en vivo en curso (se consulta cada 30 s) para avisar en el menú y con una franja arriba.
export function LiveProvider({ inicial, children }: { inicial: Estado; children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [estado, setEstado] = useState<Estado>(inicial);

  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden) return;
      const { data, error } = await supabase.rpc("live_actual");
      if (error) return;
      const fila = (Array.isArray(data) ? data[0] : null) as { estado: string; titulo: string } | null;
      const enVivo = fila?.estado === "en_vivo";
      const titulo = enVivo ? fila!.titulo : null;
      setEstado((a) => (a.enVivo === enVivo && a.titulo === titulo ? a : { enVivo, titulo }));
    }, 30000);
    return () => clearInterval(id);
  }, [supabase]);

  return <Contexto.Provider value={estado}>{children}</Contexto.Provider>;
}

export function LiveBanner() {
  const { enVivo, titulo } = useEnVivo();
  const pathname = usePathname();
  if (!enVivo || pathname.startsWith("/aulas/live")) return null;
  return (
    <Link
      href="/aulas/live"
      className="entra mb-6 flex items-center gap-3 rounded-2xl border border-[#ff3d71]/40 bg-[#ff3d71]/10 px-4 py-3 text-sm transition hover:bg-[#ff3d71]/15"
    >
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ff3d71] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
        En vivo
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="font-semibold">Aaron está en vivo</span>
        {titulo && <span className="hidden text-muted sm:inline"> · {titulo}</span>}
      </span>
      <span className="shrink-0 font-medium text-[#ff7a9c]">Entrar →</span>
    </Link>
  );
}
