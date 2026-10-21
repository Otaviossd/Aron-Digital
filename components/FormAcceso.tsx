"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ui } from "@/lib/ui";

type Props = { modo: "alumno" | "equipo"; error?: boolean };

export default function FormAcceso({ modo, error }: Props) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error">(error ? "error" : "idle");

  const [conClave, setConClave] = useState(false);
  const [clave, setClave] = useState("");

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function entrarConGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
  }

  async function enviarEnlace(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo(), shouldCreateUser: true },
    });
    setEstado(err ? "error" : "enviado");
  }

  // Entrada con contraseña: solo para cuentas que tengan una (por ejemplo, la cuenta de revisión de la Hotmart).
  async function entrarConClave(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
    if (err) return setEstado("error");
    window.location.href = modo === "equipo" ? "/admin" : "/aulas";
  }

  return (
    <div className="w-full">
      <button
        onClick={entrarConGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-bg shadow-[0_10px_40px_-14px_rgba(255,255,255,.5)] transition hover:bg-white/85"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" />
          <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z" />
          <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z" />
          <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4z" />
        </svg>
        Continuar con Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-white/10" /> o con tu email <span className="h-px flex-1 bg-white/10" />
      </div>

      {conClave ? (
        <form onSubmit={entrarConClave} className="space-y-3">
          <label className={ui.rotulo} htmlFor="email">
            Email o usuario
          </label>
          <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className={ui.campo} />
          <label className={ui.rotulo} htmlFor="clave">
            Contraseña
          </label>
          <input id="clave" type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className={ui.campo} />
          <button disabled={estado === "enviando"} className={`${ui.boton} w-full py-3.5`}>
            {estado === "enviando" ? "Entrando..." : "Entrar"}
          </button>
          {estado === "error" && <p className="text-sm text-red-300">Email o contraseña incorrectos.</p>}
          <button type="button" onClick={() => { setConClave(false); setEstado("idle"); }} className="w-full text-center text-xs text-muted underline underline-offset-4 hover:text-ink">
            Volver al enlace por email
          </button>
        </form>
      ) : estado === "enviado" ? (
        <p className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm leading-relaxed text-muted">
          Listo. Te enviamos un enlace a <span className="text-ink">{email}</span>. Revisá tu bandeja de entrada (y
          spam) y tocá el enlace para entrar.
        </p>
      ) : (
        <form onSubmit={enviarEnlace} className="space-y-3">
          <label className={ui.rotulo} htmlFor="email">
            {modo === "equipo" ? "Email del equipo" : "Email con el que compraste"}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={ui.campo}
          />
          <button disabled={estado === "enviando"} className={`${ui.boton} w-full py-3.5`}>
            {estado === "enviando" ? "Enviando..." : "Enviarme el enlace de acceso"}
          </button>
          {estado === "error" && (
            <p className="text-sm text-red-300">No pudimos validar el acceso. Revisá el email e intentá de nuevo.</p>
          )}
          <button type="button" onClick={() => { setConClave(true); setEstado("idle"); }} className="w-full text-center text-xs text-faint underline underline-offset-4 transition hover:text-muted">
            Entrar con contraseña
          </button>
        </form>
      )}

      <p className="mt-8 text-xs leading-relaxed text-faint">
        {modo === "equipo"
          ? "Acceso solo para el equipo. Si no sos parte del equipo, entrá por la página de alumnos."
          : "Usá el mismo email que pusiste al comprar. Si entrás con otro, no vamos a encontrar tu acceso."}
      </p>
    </div>
  );
}
