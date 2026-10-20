"use client";

import { useActionState, useRef } from "react";
import Avatar from "./Avatar";
import { guardarAvatar, quitarAvatar } from "@/app/aulas/actions";
import { ui } from "@/lib/ui";

export default function AvatarForm({ url, email }: { url: string | null; email: string }) {
  const [estado, accion, enviando] = useActionState(guardarAvatar, {} as { error?: string; ok?: boolean });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mb-8 flex items-center gap-5 rounded-2xl border border-line bg-surface p-5">
      <Avatar url={url} email={email} size={72} />
      <div className="min-w-0">
        <p className="text-sm font-medium">Foto de perfil</p>
        <form ref={formRef} action={accion} className="mt-2 flex flex-wrap items-center gap-2">
          <label className={`${ui.botonChico} cursor-pointer`}>
            {enviando ? "Subiendo..." : url ? "Cambiar foto" : "Subir foto"}
            <input
              name="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={enviando}
              onChange={(e) => e.currentTarget.files?.length && formRef.current?.requestSubmit()}
            />
          </label>
          {url && (
            <button formAction={quitarAvatar} className="px-2 text-xs text-faint transition hover:text-ink">
              Quitar
            </button>
          )}
        </form>
        <p className="mt-2 text-xs text-faint">JPG, PNG o WebP, hasta 4 MB.</p>
        {estado.error && <p className="mt-2 text-xs text-red-400">{estado.error}</p>}
        {estado.ok && !enviando && <p className="mt-2 text-xs text-accent">Foto actualizada.</p>}
      </div>
    </div>
  );
}
