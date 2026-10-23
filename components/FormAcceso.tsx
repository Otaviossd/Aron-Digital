"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ui } from "@/lib/ui";

type Props = { modo: "alumno" | "equipo"; error?: boolean };

export default function FormAcceso({ modo, error }: Props) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error" | "verificando" | "codigo-error">(error ? "error" : "idle");

  const [codigo, setCodigo] = useState("");
  const [conClave, setConClave] = useState(false);
  const [clave, setClave] = useState("");

  const redirectTo = () => `${window.location.origin}/auth/callback`;

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

  // Entrada con el código que llega en el mismo email (alternativa al botón/enlace).
  async function entrarConCodigo(e: React.FormEvent) {
    e.preventDefault();
    setEstado("verificando");
    const supabase = createClient();
    const { error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo.trim(), type: "email" });
    if (err) return setEstado("codigo-error");
    window.location.href = modo === "equipo" ? "/admin" : "/aulas";
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
      ) : estado === "enviado" || estado === "verificando" || estado === "codigo-error" ? (
        <div className="space-y-5">
          <p className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm leading-relaxed text-muted">
            Listo. Te enviamos un email a <span className="text-ink">{email}</span> (revisá también spam). Tenés dos formas de entrar:
            tocá el <strong className="text-ink">botón del email</strong> o escribí acá el <strong className="text-ink">código</strong> que trae.
          </p>
          <form onSubmit={entrarConCodigo} className="space-y-3">
            <label className={ui.rotulo} htmlFor="codigo">
              Código del email
            </label>
            <input
              id="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              maxLength={8}
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${ui.campo} text-center text-lg tracking-[0.4em]`}
            />
            <button disabled={estado === "verificando" || codigo.length < 6} className={`${ui.boton} w-full py-3.5`}>
              {estado === "verificando" ? "Verificando..." : "Entrar con el código"}
            </button>
            {estado === "codigo-error" && <p className="text-sm text-red-300">El código no es válido o venció. Pedí uno nuevo.</p>}
          </form>
          <button type="button" onClick={() => { setEstado("idle"); setCodigo(""); }} className="w-full text-center text-xs text-faint underline underline-offset-4 transition hover:text-muted">
            Usar otro email o pedir un código nuevo
          </button>
        </div>
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
            {estado === "enviando" ? "Enviando..." : "Enviarme el acceso por email"}
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
