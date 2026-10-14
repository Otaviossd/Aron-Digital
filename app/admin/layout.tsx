import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) notFound();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="flex items-center justify-between border-b border-white/10 bg-black px-6 py-4">
        <p className="text-sm font-black uppercase tracking-widest">
          Painel <span className="text-acid">admin</span>
        </p>
        <Link href="/aulas" className="text-xs uppercase tracking-widest text-white/50 hover:text-acid">
          Ver como aluno →
        </Link>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-8">{children}</div>
    </div>
  );
}
