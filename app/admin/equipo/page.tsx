import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";
import { Pildora, Seccion, Titulo } from "@/components/admin/ui";
import { agregarAdmin, quitarAdmin } from "../actions";

export default function EquipoPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Equipo />
    </Suspense>
  );
}

async function Equipo() {
  const supabase = await createClient();
  const [{ data }, { data: auth }] = await Promise.all([
    supabase.from("admins").select("email").order("email"),
    supabase.auth.getUser(),
  ]);
  const miEmail = auth.user?.email?.toLowerCase() ?? "";
  const equipo = (data ?? []).map((x) => x.email as string);

  return (
    <>
      <Titulo
        titulo="Equipo"
        sub="Las personas de esta lista entran por /equipo y ven este panel completo: alumnos, contenido y email marketing. Todos los demás entran como alumnos."
      />

      <Seccion titulo="Quién tiene acceso">
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface text-sm">
          {equipo.map((email) => {
            const soyYo = email.toLowerCase() === miEmail;
            return (
              <li key={email} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate font-medium">{email}</span>
                  {soyYo && <Pildora>Vos</Pildora>}
                </div>
                {!soyYo && equipo.length > 1 && (
                  <form action={quitarAdmin}>
                    <input type="hidden" name="email" value={email} />
                    <button className="text-xs text-faint transition hover:text-red-300">Quitar</button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </Seccion>

      <Seccion titulo="Agregar a alguien" sub="Usá el email con el que la persona entra (el de su cuenta de Google, por ejemplo).">
        <form action={agregarAdmin} className="flex max-w-md flex-wrap gap-3">
          <input name="email" type="email" required placeholder="persona@gmail.com" aria-label="Email" className={`${ui.campo} flex-1`} />
          <button className={ui.boton}>Agregar</button>
        </form>
      </Seccion>
    </>
  );
}
