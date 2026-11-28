"use client";

import { useEffect, useState } from "react";
import { CHECKOUT_URLS, DIAS_UPGRADE_TRIAL, PRECOS } from "@/lib/config";
import { enviarEvento } from "@/components/Rastreo";
import { ui } from "@/lib/ui";
import { normalizarTelefono, telefonoValido as validarTelefono } from "@/lib/telefono";
import { fbTrack } from "@/lib/metaPixel";

const CLAVE = "lno_trial_datos";

// Igual que Oferta.tsx pero para un único precio (US$1): pide nombre/email/WhatsApp y manda directo
// al checkout del funil de entrada, sin elegir entre planes.
export default function OfertaTrial() {
  const [paso, setPaso] = useState<"datos" | "listo">("datos");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const emailValido = /^\S+@\S+\.\S+$/.test(email.trim());
  const telefonoValido = validarTelefono(telefono);

  useEffect(() => {
    try {
      const g = JSON.parse(window.localStorage.getItem(CLAVE) ?? "null");
      if (g && typeof g.email === "string" && /^\S+@\S+\.\S+$/.test(g.email)) {
        setEmail(g.email);
        if (typeof g.nombre === "string") setNombre(g.nombre);
        if (typeof g.telefono === "string") setTelefono(g.telefono);
        setPaso("listo");
      }
    } catch {
      /* sin almacenamiento: vuelve a pedir los datos */
    }
  }, []);

  function linkCheckout() {
    const base = CHECKOUT_URLS.trial;
    if (!base) return null;
    try {
      const u = new URL(base);
      if (email) u.searchParams.set("email", email.trim().toLowerCase());
      if (nombre) u.searchParams.set("name", nombre.trim());
      if (telefono) u.searchParams.set("phonenumber", normalizarTelefono(telefono) ?? telefono.replace(/\D/g, ""));
      return u.toString();
    } catch {
      return base;
    }
  }

  async function continuar(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (nombre.trim().length < 2) return setError("Escribí tu nombre.");
    if (!emailValido) return setError("Revisá tu email.");
    if (!telefonoValido) return setError("Revisá tu WhatsApp: tiene que llevar el código de país, por ejemplo +595 981 123 456.");
    setEnviando(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: nombre.trim(), phone: telefono.trim(), source: "checkout", plan: "trial" }),
      });
    } catch {
      /* si falla el guardado igual la dejamos avanzar */
    }
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify({ nombre: nombre.trim(), email: email.trim().toLowerCase(), telefono: telefono.trim() }));
    } catch {
      /* ignorar */
    }
    enviarEvento("/ventas", "checkout");
    fbTrack("Lead");
    setEnviando(false);
    setPaso("listo");
  }

  const href = linkCheckout();

  return (
    <div id="comprar" className="cristal scroll-mt-8 rounded-3xl p-6 sm:p-8">
      {paso === "datos" ? (
        <form onSubmit={continuar} noValidate>
          <h3 className="mb-2 text-2xl font-semibold tracking-tight">Entrá por US${PRECOS.trial.valor}</h3>
          <p className="mb-6 text-sm leading-relaxed text-muted">Dejanos tus datos y te mandamos el acceso por email al instante.</p>

          <label htmlFor="ot-nombre" className="mb-1.5 block text-xs font-medium text-muted">
            Tu nombre
          </label>
          <input id="ot-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" placeholder="Tu nombre" className={`${ui.campo} mb-4`} />

          <label htmlFor="ot-email" className="mb-1.5 block text-xs font-medium text-muted">
            Tu email de acceso
          </label>
          <input id="ot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" className={`${ui.campo} mb-4`} />

          <label htmlFor="ot-tel" className="mb-1.5 block text-xs font-medium text-muted">
            Tu WhatsApp (con código de país)
          </label>
          <input id="ot-tel" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" placeholder="+595 981 000 000" className={`${ui.campo} mb-3`} />

          <p className="mb-5 text-[11px] leading-relaxed text-faint">
            Al continuar aceptás que usemos tu email y tu WhatsApp para enviarte el acceso, avisos y novedades del curso. Podés darte de baja cuando quieras.
          </p>
          {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
          <button disabled={enviando} className={`${ui.boton} w-full disabled:opacity-60`}>
            {enviando ? "Un momento…" : `Desbloqueá tu acceso por US$${PRECOS.trial.valor}`}
          </button>
        </form>
      ) : (
        <div>
          <h3 className="mb-2 text-2xl font-semibold tracking-tight">{nombre ? `${nombre.split(" ")[0]}, ya casi` : "Ya casi"}</h3>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Por US${PRECOS.trial.valor} ya entrás a probar el curso por tu cuenta. Si te gusta lo que ves, tenés {DIAS_UPGRADE_TRIAL} días para pasar al acceso vitalicio completo al precio de
            lanzamiento, desde adentro de la plataforma.
          </p>
          {href ? (
            <a
              href={href}
              onClick={() => fbTrack("InitiateCheckout", { value: PRECOS.trial.valor, currency: "USD", content_name: "Trial US$1" })}
              className={`${ui.boton} w-full py-3.5`}
            >
              Pagar US${PRECOS.trial.valor} y entrar
            </a>
          ) : (
            <span className={`${ui.boton} w-full cursor-not-allowed py-3.5 opacity-50`}>Próximamente</span>
          )}
          <p className="mt-5 text-xs leading-relaxed text-faint">Recibís el acceso por email al instante.</p>
        </div>
      )}
    </div>
  );
}
