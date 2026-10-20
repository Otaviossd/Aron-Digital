"use client";

import { useState } from "react";
import { enviarEvento } from "@/components/Rastreo";
import { WHATSAPP_GRUPO_URL } from "@/lib/config";
import { ui } from "@/lib/ui";

type Props = {
  // "oscuro": sobre el fondo negro de la página. "claro": dentro de la tarjeta clara del final.
  tono?: "oscuro" | "claro";
  // Hace único el id del campo cuando hay dos formularios en la misma página.
  id?: string;
  textoBoton?: string;
};

export default function FormCaptura({ tono = "oscuro", id = "captura", textoBoton = "Quiero entrar a la lista" }: Props) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "error">("idle");
  const claro = tono === "claro";

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
      <div className={`rounded-2xl border p-6 ${claro ? "border-black/10 bg-white text-bg" : "border-accent/30 bg-accent/[0.06]"}`}>
        <p className="text-lg font-semibold tracking-tight">¡Listo, estás en la lista!</p>
        <p className={`mt-2 text-sm leading-relaxed ${claro ? "text-black/60" : "text-muted"}`}>
          Para quedarte con el descuento exclusivo, entrá ahora al grupo de WhatsApp. Ahí avisamos todo primero.
        </p>
        <a
          href={WHATSAPP_GRUPO_URL}
          target="_blank"
          rel="noreferrer"
          className="neon mt-5 flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition"
        >
          Entrar al grupo de WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar}>
      <label htmlFor={`email-${id}`} className={`mb-2 block text-xs font-medium ${claro ? "text-black/60" : "text-muted"}`}>
        Tu mejor email
      </label>
      <input
        id={`email-${id}`}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className={`w-full rounded-xl border px-4 py-3.5 text-base outline-none transition ${
          claro
            ? "border-black/10 bg-white text-bg placeholder:text-black/35 focus:border-black/40"
            : "border-white/15 bg-black/50 placeholder:text-faint focus:border-accent/70 focus:shadow-[0_0_0_4px_rgba(57,255,126,.12)]"
        }`}
      />
      <button
        disabled={estado === "enviando"}
        className="neon mt-3 flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando..." : textoBoton}
      </button>
      {estado === "error" && <p className="mt-3 text-sm text-red-400">No pudimos guardar tu email. Intentá de nuevo.</p>}
      <p className={`mt-4 text-xs leading-relaxed ${claro ? "text-black/45" : "text-faint"}`}>
        Usamos tu email solo para avisarte del lanzamiento. Podés darte de baja cuando quieras.
      </p>
    </form>
  );
}
