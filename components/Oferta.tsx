"use client";

import { useEffect, useState } from "react";
import { CHECKOUT_URLS, PRECOS } from "@/lib/config";
import { enviarEvento } from "@/components/Rastreo";
import { ui } from "@/lib/ui";

type Tipo = "promo" | "anual" | "vitalicio";

// Antes de ver los precios y pasar al checkout, la persona deja nombre, email y WhatsApp.
// Así podemos recuperar la venta por email y por WhatsApp si no termina de pagar.
export default function Oferta({ vagasRestantes }: { vagasRestantes: number }) {
  const [paso, setPaso] = useState<"datos" | "oferta">("datos");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const emailValido = /^\S+@\S+\.\S+$/.test(email.trim());
  const telefonoValido = telefono.replace(/\D/g, "").length >= 8;
  const promo = vagasRestantes > 0;

  // Link de los emails de carrito abandonado (?email=...): ya dejó sus datos, va directo a la oferta.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const e = q.get("email");
    if (e && /^\S+@\S+\.\S+$/.test(e)) {
      setEmail(e);
      const n = q.get("nombre");
      if (n) setNombre(n);
      setPaso("oferta");
    }
  }, []);

  async function continuar(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (nombre.trim().length < 2) return setError("Escribí tu nombre.");
    if (!emailValido) return setError("Revisá tu email.");
    if (!telefonoValido) return setError("Escribí tu WhatsApp con el código de país.");
    setEnviando(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: nombre.trim(), phone: telefono.trim(), source: "checkout", plan: promo ? "promo" : "anual" }),
      });
    } catch {
      /* si falla el guardado igual la dejamos avanzar */
    }
    enviarEvento("/ventas", "checkout");
    setEnviando(false);
    setPaso("oferta");
  }

  // Manda a la Hotmart con los datos ya completados (ignora los parámetros que no soporte).
  function linkCheckout(o: Tipo) {
    const base = CHECKOUT_URLS[o];
    if (!base) return null;
    try {
      const u = new URL(base);
      if (email) u.searchParams.set("email", email.trim().toLowerCase());
      if (nombre) u.searchParams.set("name", nombre.trim());
      if (telefono) u.searchParams.set("phonenumber", telefono.replace(/\D/g, ""));
      return u.toString();
    } catch {
      return base;
    }
  }

  const Boton = ({ o, texto, destacado }: { o: Tipo; texto: string; destacado?: boolean }) => {
    const href = linkCheckout(o);
    const clase = destacado ? `${ui.boton} w-full` : `${ui.botonSuave} w-full justify-center`;
    return href ? (
      <a href={href} className={clase}>
        {texto}
      </a>
    ) : (
      <span className={`${clase} cursor-not-allowed opacity-50`}>Checkout próximamente</span>
    );
  };

  return (
    <div id="comprar" className="cristal scroll-mt-8 rounded-3xl p-6 sm:p-8">
      {paso === "datos" ? (
        <form onSubmit={continuar} noValidate>
          <p className="mb-2 text-sm font-medium text-accent">Paso 1 de 2</p>
          <h3 className="mb-2 text-2xl font-semibold tracking-tight">Dejanos tus datos y mirá la oferta</h3>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Te mostramos los precios y te mandamos el acceso por email apenas pagás.
          </p>

          <label htmlFor="of-nombre" className="mb-1.5 block text-xs font-medium text-muted">
            Tu nombre
          </label>
          <input id="of-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" placeholder="Tu nombre" className={`${ui.campo} mb-4`} />

          <label htmlFor="of-email" className="mb-1.5 block text-xs font-medium text-muted">
            Tu email de acceso
          </label>
          <input id="of-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" className={`${ui.campo} mb-4`} />

          <label htmlFor="of-tel" className="mb-1.5 block text-xs font-medium text-muted">
            Tu WhatsApp (con código de país)
          </label>
          <input id="of-tel" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" placeholder="+595 981 000 000" className={`${ui.campo} mb-3`} />

          <p className="mb-5 text-[11px] leading-relaxed text-faint">
            Al continuar aceptás que usemos tu email y tu WhatsApp para enviarte el acceso, avisos y novedades del curso. Podés darte de baja cuando quieras.
          </p>
          {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
          <button disabled={enviando} className={`${ui.boton} w-full disabled:opacity-60`}>
            {enviando ? "Un momento…" : "Ver la oferta"}
          </button>
        </form>
      ) : (
        <div>
          <p className="mb-2 text-sm font-medium text-accent">Paso 2 de 2</p>
          <h3 className="mb-6 text-2xl font-semibold tracking-tight">{nombre ? `${nombre.split(" ")[0]}, esta es tu oferta` : "Esta es tu oferta"}</h3>

          {promo && (
            <div className="relative mb-4 overflow-hidden rounded-2xl border border-accent/40 bg-accent/[0.07] p-5 shadow-[0_0_60px_-20px_rgba(57,255,126,.6)]">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">
                Lanzamiento · cupos limitados
              </span>
              <p className="flex items-baseline gap-3">
                <span className="text-5xl font-semibold tracking-tight">US${PRECOS.promo.valor}</span>
                <span className="text-lg text-faint line-through">US${PRECOS.vitalicio.valor}</span>
              </p>
              <p className="mt-2 text-sm text-muted">
                Pago único y acceso <strong className="text-ink">vitalicio</strong> con todas las actualizaciones. Solo para las primeras personas: cuando se agoten los cupos, vuelve al precio normal.
              </p>
              <div className="mt-5">
                <Boton o="promo" texto="Quiero mi lugar de lanzamiento" destacado />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-muted">{PRECOS.vitalicio.rotulo}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">US${PRECOS.vitalicio.valor}</p>
              <p className="mb-4 mt-1 text-xs leading-snug text-faint">{PRECOS.vitalicio.detalle}</p>
              <Boton o="vitalicio" texto="Elegir vitalicio" destacado={!promo} />
            </div>
            <div className="rounded-2xl border border-line bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-muted">{PRECOS.anual.rotulo}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">US${PRECOS.anual.valor}</p>
              <p className="mb-4 mt-1 text-xs leading-snug text-faint">{PRECOS.anual.detalle}</p>
              <Boton o="anual" texto="Elegir 1 año" />
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-faint">
            Recibís el acceso por email al instante. Es un pago único, sin cobros mensuales. Reembolso disponible solo durante los primeros 7 días.
          </p>
        </div>
      )}
    </div>
  );
}
