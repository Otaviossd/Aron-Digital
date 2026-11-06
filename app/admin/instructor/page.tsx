import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/env";
import { cargarFirma, RUTA_FIRMA } from "@/lib/firma";
import { Seccion, Titulo } from "@/components/admin/ui";
import { ui } from "@/lib/ui";
import FormFirma from "@/components/admin/FormFirma";
import { agregarInstructor, quitarInstructor } from "../comentarios/actions";

export default function InstructorPage() {
  return (
    <>
      <Titulo
        titulo="Instructor"
        sub="Quién lleva el sello verificado de Instructor en comentarios y chats en vivo, y la firma que aparece en los certificados."
      />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-white/[0.03]" />}>
        <Contenido />
      </Suspense>
    </>
  );
}

async function Contenido() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("instructores").select("email, nombre").order("email");
  if (error) {
    return (
      <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-6 text-sm text-amber-200">
        Faltan las tablas de la plataforma v2. Ejecutá <code className="font-mono">supabase/plataforma-v2.sql</code> en el SQL Editor de Supabase.
      </p>
    );
  }
  const instructores = (data ?? []) as { email: string; nombre: string }[];
  const firma = await cargarFirma();
  const urlFirma = firma ? `${supabaseUrl()}/storage/v1/object/public/covers/${RUTA_FIRMA}?v=${firma.length}` : null;

  return (
    <>
      <Seccion titulo="Instructores verificados" sub="Los comentarios y mensajes que escriban estas cuentas salen con el sello “Instructor”. Usá el e-mail con el que Aaron inicia sesión.">
        <ul className="mb-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {instructores.length === 0 && <li className="px-5 py-5 text-sm text-faint">Todavía no hay ningún instructor. Agregá a Aaron abajo.</li>}
          {instructores.map((i) => (
            <li key={i.email} className="flex items-center gap-3 px-5 py-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{i.nombre}</p>
                <p className="truncate text-xs text-faint">{i.email}</p>
              </div>
              <form action={quitarInstructor}>
                <input type="hidden" name="email" value={i.email} />
                <button className="text-xs text-faint transition hover:text-red-300">Quitar</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={agregarInstructor} className="grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className={ui.rotulo} htmlFor="email">
              E-mail de inicio de sesión
            </label>
            <input id="email" name="email" type="email" required placeholder="aaron@…" className={ui.campo} />
          </div>
          <div>
            <label className={ui.rotulo} htmlFor="nombre">
              Nombre que se muestra
            </label>
            <input id="nombre" name="nombre" defaultValue="Aaron Dalla Rosa" className={ui.campo} />
          </div>
          <button className={ui.boton}>Agregar</button>
        </form>
      </Seccion>

      <Seccion titulo="Firma del certificado" sub="Se estampa en el PDF que descargan los alumnos al terminar el curso.">
        <FormFirma urlActual={urlFirma} />
      </Seccion>
    </>
  );
}
