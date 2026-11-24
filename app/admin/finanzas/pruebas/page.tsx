import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Seccion, Titulo } from "@/components/admin/ui";
import { ui } from "@/lib/ui";
import { marcarPrueba, quitarPrueba } from "./actions";

export default function PruebasPage() {
  return (
    <>
      <Titulo
        titulo="Compras de prueba"
        sub="E-mails que no cuentan en ningún número del panel (Finanzas, alumnos activos, vistas…). No borra ninguna compra real, solo la saca de las cuentas."
      />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-white/[0.03]" />}>
        <Contenido />
      </Suspense>
    </>
  );
}

async function Contenido() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("emails_excluidos").select("email").order("email");
  if (error) {
    return (
      <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-6 text-sm text-amber-200">
        Falta la tabla <code className="font-mono">emails_excluidos</code>. Ejecutá <code className="font-mono">supabase/excluir-pruebas.sql</code> en el SQL Editor de Supabase.
      </p>
    );
  }
  const emails = (data ?? []).map((r) => r.email as string);

  return (
    <Seccion titulo="E-mails marcados como prueba" sub="Agregá acá cualquier compra tuya o de Aaron que fue solo para probar, antes del lanzamiento real.">
      <ul className="mb-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {emails.length === 0 && <li className="px-5 py-5 text-sm text-faint">Todavía no hay ningún e-mail marcado.</li>}
        {emails.map((email) => (
          <li key={email} className="flex items-center gap-3 px-5 py-4 text-sm">
            <p className="min-w-0 flex-1 truncate font-medium">{email}</p>
            <form action={quitarPrueba}>
              <input type="hidden" name="email" value={email} />
              <button className="text-xs text-faint transition hover:text-red-300">Quitar</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={marcarPrueba} className="grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className={ui.rotulo} htmlFor="email">
            E-mail de la compra de prueba
          </label>
          <input id="email" name="email" type="email" required placeholder="aaron@…" className={ui.campo} />
        </div>
        <button className={ui.boton}>Marcar como prueba</button>
      </form>
    </Seccion>
  );
}
