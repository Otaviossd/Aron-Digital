"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EntrarPage() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "erro">("idle");

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function entrarComGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  }

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo(), shouldCreateUser: true },
    });
    setEstado(error ? "erro" : "enviado");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <div className="w-full max-w-md">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d4ff00]">
          Área de alumnos
        </p>
        <h1 className="mb-8 text-5xl font-black uppercase leading-[0.95] tracking-tight">
          Entrá a tu <span className="text-[#d4ff00]">curso</span>
        </h1>

        <button
          onClick={entrarComGoogle}
          className="mb-4 w-full rounded-none border-2 border-white bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-[#d4ff00] hover:border-[#d4ff00]"
        >
          Continuar con Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-white/40">
          <span className="h-px flex-1 bg-white/20" /> o <span className="h-px flex-1 bg-white/20" />
        </div>

        {estado === "enviado" ? (
          <p className="border-2 border-[#d4ff00] p-4 text-sm">
            Listo. Te enviamos un enlace a <strong>{email}</strong>. Revisá tu bandeja de entrada
            (y spam) y tocá el enlace para entrar.
          </p>
        ) : (
          <form onSubmit={enviarLink} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/60">
              Email con el que compraste
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full border-2 border-white/30 bg-transparent px-4 py-4 text-base outline-none focus:border-[#d4ff00]"
            />
            <button
              disabled={estado === "enviando"}
              className="w-full border-2 border-[#d4ff00] bg-[#d4ff00] px-5 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-transparent hover:text-[#d4ff00] disabled:opacity-50"
            >
              {estado === "enviando" ? "Enviando..." : "Enviarme el enlace de acceso"}
            </button>
            {estado === "erro" && (
              <p className="text-sm text-red-400">
                No pudimos enviar el enlace. Revisá el email e intentá de nuevo.
              </p>
            )}
          </form>
        )}

        <p className="mt-8 text-xs leading-relaxed text-white/40">
          Usá el mismo email que pusiste al comprar. Si entrás con otro email, no vamos a encontrar
          tu acceso.
        </p>
      </div>
    </main>
  );
}
