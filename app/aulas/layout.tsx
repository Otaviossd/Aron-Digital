import { Suspense } from "react";
import Sidebar from "@/components/members/Sidebar";
import { getMemberData } from "@/lib/members";
import { BRAND, WHATSAPP_ALUMNOS_URL } from "@/lib/config";
import Link from "next/link";
import Avatar from "@/components/members/Avatar";
import BarraInferior from "@/components/members/BarraInferior";
import { LiveBanner, LiveProvider } from "@/components/live/LiveProvider";

export default function AulasLayout({ children }: LayoutProps<"/aulas">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { supabase, email, esAdmin, porcentaje, avatarUrl, vistaAlumno } = await getMemberData();
  // ¿Hay una clase en vivo ahora? (si todavía no se creó la tabla, simplemente no hay)
  const { data: liveRaw } = await supabase.rpc("live_actual");
  const live = (Array.isArray(liveRaw) ? liveRaw[0] : null) as { estado: string; titulo: string } | null;
  const enVivo = live?.estado === "en_vivo";

  return (
    <LiveProvider inicial={{ enVivo, titulo: enVivo ? live!.titulo : null }}>
    <div className="relative min-h-screen overflow-x-clip bg-bg">
      {/* Luces suaves de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="luz absolute -right-56 -top-56 h-[44rem] w-[44rem]" />
        <div className="luz absolute left-1/3 top-[30rem] h-[36rem] w-[36rem] [--luz:rgba(34,211,238,0.09)]" />
        <div className="luz absolute -left-32 top-[64rem] h-[34rem] w-[34rem] [--luz:rgba(57,255,126,0.09)]" />
      </div>
      <Sidebar
        brand={BRAND}
        email={email}
        porcentaje={porcentaje}
        esAdmin={esAdmin}
        vistaAlumno={vistaAlumno}
        avatarUrl={avatarUrl}
        instagramUrl={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
        whatsappUrl={WHATSAPP_ALUMNOS_URL}
      />

      <div className="relative lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-bg/95 py-3 pl-16 pr-4 lg:px-10">
          <form action="/aulas/buscar" className="w-full max-w-md">
            <input
              name="q"
              type="search"
              placeholder="Buscar módulos y clases"
              aria-label="Buscar módulos y clases"
              className="w-full rounded-full border border-line bg-white/[0.03] px-5 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-white/35"
            />
          </form>
          <Link href="/aulas/cuenta" aria-label="Mi cuenta" className="ml-auto shrink-0">
            <Avatar url={avatarUrl} email={email} size={36} />
          </Link>
        </header>

        <div className="mx-auto max-w-6xl px-5 pb-28 pt-8 lg:px-10 lg:py-10">
          <LiveBanner />
          {children}
        </div>
      </div>
      <BarraInferior />
    </div>
    </LiveProvider>
  );
}
