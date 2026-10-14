import { Suspense } from "react";
import Sidebar from "@/components/members/Sidebar";
import { BRAND, getMemberData } from "@/lib/members";

export default function AulasLayout({ children }: LayoutProps<"/aulas">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { email, esAdmin, porcentaje } = await getMemberData();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Sidebar
        brand={BRAND}
        email={email}
        porcentaje={porcentaje}
        esAdmin={esAdmin}
        instagramUrl={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
        soporteEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-black/90 py-3 pl-16 pr-4 backdrop-blur lg:pl-8 lg:pr-8">
          <form action="/aulas/buscar" className="w-full max-w-md">
            <input
              name="q"
              type="search"
              placeholder="Buscar módulos y clases..."
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-acid"
            />
          </form>
          <span className="hidden shrink-0 text-xs font-bold uppercase tracking-widest text-white/40 sm:block">
            {BRAND}
          </span>
        </header>

        <div className="px-5 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
