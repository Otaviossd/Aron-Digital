"use client";

import { useState } from "react";
import { enviarEvento } from "@/components/Rastreo";
import { WHATSAPP_GRUPO_URL } from "@/lib/config";
import { ui } from "@/lib/ui";

export default function FormCaptura() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "error">("idle");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "captura" }),
      });
      if (!res.ok) throw new Error("fallo");
      enviarEvento("/captura", "lead");
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "listo") {
    return (
      <div className="max-w-md rounded-2xl border border-line-strong bg-white/[0.04] p-6 backdrop-blur">
        <p className="text-lg font-semibold tracking-tight">¡Listo, estás en la lista!</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Te avisamos por email apenas abramos las inscripciones. Sumate también al grupo de WhatsApp para enterarte
          de todo primero.
        </p>
        <a href={WHATSAPP_GRUPO_URL} target="_blank" rel="noreferrer" className={`${ui.boton} mt-5 w-full`}>
          Entrar al grupo de WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="max-w-md">
      <label htmlFor="email-captura" className="sr-only">
        Tu email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="email-captura"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full flex-1 rounded-full border border-line-strong bg-black/40 px-5 py-3.5 text-base outline-none backdrop-blur transition placeholder:text-faint focus:border-white/50"
        />
        <button disabled={estado === "enviando"} className={`${ui.boton} shrink-0 py-3.5`}>
          {estado === "enviando" ? "Enviando..." : "Quiero que me avisen"}
        </button>
      </div>
      {estado === "error" && <p className="mt-3 text-sm text-red-300">No pudimos guardar tu email. Intentá de nuevo.</p>}
      <p className="mt-4 text-xs leading-relaxed text-faint">
        Usamos tu email solo para avisarte del curso. Podés darte de baja cuando quieras.
      </p>
    </form>
  );
}
