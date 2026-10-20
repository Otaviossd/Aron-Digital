import { Suspense } from "react";
import { getMemberData } from "@/lib/members";
import { DIAS_REEMBOLSO } from "@/lib/config";
import CancelButton from "../CancelButton";
import AvatarForm from "@/components/members/AvatarForm";

export default function CuentaPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Cuenta />
    </Suspense>
  );
}

async function Cuenta() {
  const { supabase, email, avatarUrl } = await getMemberData();

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
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Mi cuenta</h1>

      <AvatarForm url={avatarUrl} email={email} />

      <dl className="mb-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface text-sm">
        <div className="flex justify-between gap-4 px-5 py-4">
          <dt className="text-muted">Email de acceso</dt>
          <dd className="font-medium">{email}</dd>
        </div>
        {sub && (
          <>
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-muted">Plan</dt>
              <dd className="font-medium">{sub.plan === "annual" ? "Anual" : "Mensual"}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-muted">Estado</dt>
              <dd className="font-medium">{sub.status === "active" ? "Activa" : sub.status === "cancelled" ? "Cancelada" : sub.status}</dd>
            </div>
            {compra && (
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-muted">Fecha de compra</dt>
              <dd className="font-medium">{fmt(compra)}</dd>
            </div>
            )}
            {sub.access_until && (
            <div className="flex justify-between gap-4 px-5 py-4">
              <dt className="text-muted">{sub.status === "active" ? "Próxima cobranza" : "Acceso hasta"}</dt>
              <dd className="font-medium">{fmt(sub.access_until)}</dd>
            </div>
            )}
          </>
        )}
      </dl>

      {sub && (
        <div className="text-sm leading-relaxed text-muted">
          <p className="mb-4">
            {enVentana && finReembolso
              ? `Podés pedir reembolso hasta el ${fmt(finReembolso)} escribiéndonos a soporte (menú Soporte). Después de esa fecha solo podés cancelar las próximas cobranzas.`
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
