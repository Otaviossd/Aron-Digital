"use client";

import { useActionState } from "react";
import { emitirCertificado } from "@/app/aulas/actions";
import { ui } from "@/lib/ui";

export default function FormCertificado({ nombre, etiqueta, nota }: { nombre: string; etiqueta: string; nota?: string }) {
  const [estado, accion, enviando] = useActionState(emitirCertificado, {} as { error?: string; ok?: boolean });
  return (
    <form action={accion}>
      <label htmlFor="nombre-certificado" className={ui.rotulo}>
        Tu nombre completo, tal como querés que aparezca
      </label>
      <input
        id="nombre-certificado"
        name="nombre"
        defaultValue={nombre}
        required
        minLength={5}
        maxLength={80}
        autoComplete="name"
        placeholder="Nombre y apellido"
        className={ui.campo}
      />
      {nota && <p className="mt-2 text-xs text-faint">{nota}</p>}
      <button disabled={enviando} className={`${ui.boton} mt-4 w-full sm:w-auto`}>
        {enviando ? "Generando…" : etiqueta}
      </button>
      {estado.error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {estado.error}
        </p>
      )}
    </form>
  );
}
