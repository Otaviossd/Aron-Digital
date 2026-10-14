import { Suspense } from "react";
import { getMemberData } from "@/lib/members";
import { DIAS_REEMBOLSO } from "@/lib/config";
import CancelButton from "../CancelButton";

export default function CuentaPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Cuenta />
    </Suspense>
  );
}

async function Cuenta() {
  const { supabase, email } = await getMemberData();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, purchased_at, access_until")
    .eq("email", email.toLowerCase())
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const fmt = (d: string | Date) =>
    new Date(d).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" });

  const compra = sub?.purchased_at ? new Date(sub.purchased_at) : null;
  const finReembolso = compra ? new Date(compra.getTime() + DIAS_REEMBOLSO * 86400000) : null;
  const enVentana = finReembolso ? finReembolso > new Date() : false;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 text-4xl font-black uppercase tracking-tight">Mi cuenta</h1>

      <dl className="mb-8 divide-y divide-white/10 border border-white/10 bg-[#141414] text-sm">
        <div className="flex justify-between px-5 py-4">
          <dt className="text-white/50">Email de acceso</dt>
          <dd className="font-semibold">{email}</dd>
        </div>
        {sub && (
          <>
            <div className="flex justify-between px-5 py-4">
              <dt className="text-white/50">Plan</dt>
              <dd className="font-semibold">{sub.plan === "annual" ? "Anual" : "Mensual"}</dd>
            </div>
            <div className="flex justify-between px-5 py-4">
              <dt className="text-white/50">Estado</dt>
              <dd className="font-semibold">{sub.status === "active" ? "Activa" : sub.status === "cancelled" ? "Cancelada" : sub.status}</dd>
            </div>
            {compra && (
              <div className="flex justify-between px-5 py-4">
                <dt className="text-white/50">Fecha de compra</dt>
                <dd className="font-semibold">{fmt(compra)}</dd>
              </div>
            )}
            {sub.access_until && (
              <div className="flex justify-between px-5 py-4">
                <dt className="text-white/50">{sub.status === "active" ? "Próxima cobranza" : "Acceso hasta"}</dt>
                <dd className="font-semibold">{fmt(sub.access_until)}</dd>
              </div>
            )}
          </>
        )}
      </dl>

      {sub && (
        <div className="text-sm text-white/60">
          <p className="mb-4">
            {enVentana && finReembolso
              ? `Podés pedir reembolso hasta el ${fmt(finReembolso)} escribiéndonos por soporte. Después de esa fecha solo podés cancelar las próximas cobranzas.`
              : "El período de reembolso ya terminó. Podés cancelar las próximas cobranzas cuando quieras."}
          </p>
          {sub.status === "active" ? (
            <CancelButton />
          ) : (
            <p>Tu suscripción está cancelada. Mantenés el acceso hasta el fin del período pagado.</p>
          )}
        </div>
      )}
    </div>
  );
}
