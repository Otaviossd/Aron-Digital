import { Suspense } from "react";
import Sidebar from "@/components/members/Sidebar";
import { getMemberData } from "@/lib/members";
import { BRAND } from "@/lib/config";

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
    <div className="min-h-screen bg-bg">
      <Sidebar
        brand={BRAND}
        email={email}
        porcentaje={porcentaje}
        esAdmin={esAdmin}
        instagramUrl={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
        soporteEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
      />

      <div className="lg:pl-60">
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
        </header>

        <div className="mx-auto max-w-6xl px-5 py-10 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
