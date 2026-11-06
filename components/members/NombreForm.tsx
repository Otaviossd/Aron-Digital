"use client";

import { useActionState } from "react";
import { guardarNombre } from "@/app/aulas/actions";
import { ui } from "@/lib/ui";

export default function NombreForm({ nombre }: { nombre: string }) {
  const [estado, accion, enviando] = useActionState(guardarNombre, {} as { error?: string; ok?: boolean });
  return (
    <form action={accion} className="mb-8 rounded-2xl border border-line bg-surface p-5">
      <label htmlFor="nombre" className="text-sm font-medium">
        Tu nombre
      </label>
      <p className="mt-1 text-xs text-faint">Es el que ven los demás en los comentarios, la comunidad y las clases en vivo.</p>
      <div className="mt-3 flex gap-2">
        <input id="nombre" name="nombre" defaultValue={nombre} maxLength={60} autoComplete="name" className={ui.campo} />
        <button disabled={enviando} className={`${ui.botonChico} shrink-0 px-5`}>
          {enviando ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {estado.error && <p className="mt-2 text-xs text-red-400">{estado.error}</p>}
      {estado.ok && !enviando && <p className="mt-2 text-xs text-accent">Nombre actualizado.</p>}
    </form>
  );
}
