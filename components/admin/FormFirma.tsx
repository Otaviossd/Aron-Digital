"use client";

import { useActionState, useRef } from "react";
import { subirFirma, quitarFirma, type EstadoFirma } from "@/app/admin/instructor/actions";
import { ui } from "@/lib/ui";
import EnlacePdf from "@/components/members/EnlacePdf";

export default function FormFirma({ urlActual }: { urlActual: string | null }) {
  const [estado, accion, enviando] = useActionState(subirFirma, {} as EstadoFirma);
  const form = useRef<HTMLFormElement>(null);
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex h-28 items-center justify-center rounded-xl border border-line bg-[#07090a]">
        {urlActual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlActual} alt="Firma de Aaron" className="max-h-24 max-w-full object-contain" />
        ) : (
          <p className="px-4 text-center text-xs text-faint">Todavía no hay firma. Mientras tanto el certificado usa el nombre de Aaron en cursiva.</p>
        )}
      </div>
      <form ref={form} action={accion} className="mt-4 flex flex-wrap items-center gap-3">
        <label className={`${ui.botonChico} cursor-pointer`}>
          {enviando ? "Procesando…" : urlActual ? "Cambiar firma" : "Subir firma"}
          <input name="firma" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={enviando} onChange={(e) => e.currentTarget.files?.length && form.current?.requestSubmit()} />
        </label>
        {urlActual && (
          <button formAction={quitarFirma} className="text-xs text-faint transition hover:text-red-300">
            Quitar
          </button>
        )}
        <EnlacePdf demo className="ml-auto text-xs text-accent hover:underline">
          Ver certificado de ejemplo
        </EnlacePdf>
      </form>
      <p className="mt-3 text-xs leading-relaxed text-faint">
        Sacá una foto de la firma de Aaron con tinta oscura sobre papel blanco, bien de frente y con buena luz. Se recorta y se le quita el fondo automáticamente.
      </p>
      {estado.error && <p className="mt-2 text-xs text-red-400">{estado.error}</p>}
      {estado.ok && !enviando && <p className="mt-2 text-xs text-accent">Firma actualizada. Ya aparece en los certificados nuevos y en las descargas.</p>}
    </div>
  );
}
