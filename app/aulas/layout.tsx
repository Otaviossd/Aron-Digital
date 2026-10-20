import { Suspense } from "react";
import Sidebar from "@/components/members/Sidebar";
import { getMemberData } from "@/lib/members";
import { BRAND } from "@/lib/config";
import Link from "next/link";
import Avatar from "@/components/members/Avatar";

export default function AulasLayout({ children }: LayoutProps<"/aulas">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { email, esAdmin, porcentaje, avatarUrl } = await getMemberData();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg">
      {/* Luces suaves de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-accent/[0.09] blur-[120px]" />
        <div className="absolute left-1/3 top-[38rem] h-[26rem] w-[26rem] rounded-full bg-white/[0.035] blur-[110px]" />
      </div>
      <Sidebar
        brand={BRAND}
        email={email}
        porcentaje={porcentaje}
        esAdmin={esAdmin}
        avatarUrl={avatarUrl}
        instagramUrl={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
      />

      <div className="relative lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-bg/85 py-3 pl-16 pr-4 backdrop-blur lg:px-10">
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

        <div className="mx-auto max-w-6xl px-5 py-10 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
