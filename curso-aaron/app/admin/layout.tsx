import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/config";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
  if (!user) redirect("/equipo");

  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) notFound();

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar brand={BRAND} email={user.email ?? ""} />
      <div className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-5 py-10 pt-20 lg:px-10 lg:pt-10">{children}</div>
      </div>
    </div>
  );
}
