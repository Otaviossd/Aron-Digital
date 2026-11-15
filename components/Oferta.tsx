"use client";

import { useEffect, useState } from "react";
import { CHECKOUT_URLS, PRECOS } from "@/lib/config";
import { enviarEvento } from "@/components/Rastreo";
import { ui } from "@/lib/ui";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import { normalizarTelefono, telefonoValido as validarTelefono } from "@/lib/telefono";

const CLAVE = "lno_oferta_datos";

type Tipo = "promo" | "anual" | "vitalicio";

// Antes de ver los precios y pasar al checkout, la persona deja nombre, email y WhatsApp.
// Así podemos recuperar la venta por email y por WhatsApp si no termina de pagar.
export default function Oferta({ vagasRestantes, promoFin }: { vagasRestantes: number; promoFin: string }) {
  const [paso, setPaso] = useState<"datos" | "oferta">("datos");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const emailValido = /^\S+@\S+\.\S+$/.test(email.trim());
  const telefonoValido = validarTelefono(telefono);
  const promo = vagasRestantes > 0;

  const opciones: {
    id: Tipo;
    nombre: string;
    sub: string;
    valor: number;
    tachado?: number;
    etiqueta?: string;
    incluye: string[];
  }[] = [
    ...(promo
      ? [
          {
            id: "promo" as const,
            nombre: "Acceso vitalicio · Lanzamiento",
            sub: "Precio especial para los primeros",
            valor: PRECOS.promo.valor,
            tachado: PRECOS.vitalicio.valor,
            etiqueta: "Cupos limitados",
            incluye: ["Acceso para siempre", "Todas las actualizaciones y clases nuevas", "Los 2 bonos incluidos", "Pagás una sola vez"],
          },
        ]
      : []),
    {
      id: "vitalicio" as const,
      nombre: "Acceso vitalicio",
      sub: "El curso para siempre",
      valor: PRECOS.vitalicio.valor,
      etiqueta: promo ? undefined : "Recomendado",
      incluye: ["Acceso para siempre", "Todas las actualizaciones y clases nuevas", "Los 2 bonos incluidos", "Pagás una sola vez"],
    },
    {
      id: "anual" as const,
      nombre: "Acceso de 1 año",
      sub: "12 meses desde tu compra",
      valor: PRECOS.anual.valor,
      incluye: ["Acceso por 12 meses", "Clases nuevas durante ese año", "Los 2 bonos incluidos", "Pagás una sola vez"],
    },
  ];
  const [eleccion, setEleccion] = useState<Tipo>(promo ? "promo" : "vitalicio");
  const elegida = opciones.find((o) => o.id === eleccion) ?? opciones[0];
  const hrefElegido = linkCheckout(elegida.id);
  const diferencia = PRECOS.vitalicio.valor - PRECOS.anual.valor;

  // Link de los emails de carrito abandonado (?email=...): ya dejó sus datos, va directo a la oferta.
  // Si ya dejó sus datos y vuelve del checkout, no se los pedimos de nuevo.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const e = q.get("email");
    if (e && /^\S+@\S+\.\S+$/.test(e)) {
      setEmail(e);
      const n = q.get("nombre");
      if (n) setNombre(n);
      setPaso("oferta");
      return;
    }
    try {
      const g = JSON.parse(window.localStorage.getItem(CLAVE) ?? "null");
      if (g && typeof g.email === "string" && /^\S+@\S+\.\S+$/.test(g.email)) {
        setEmail(g.email);
        if (typeof g.nombre === "string") setNombre(g.nombre);
        if (typeof g.telefono === "string") setTelefono(g.telefono);
        setPaso("oferta");
      }
    } catch {
      /* sin almacenamiento: vuelve a pedir los datos */
    }
  }, []);

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
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: nombre.trim(), phone: telefono.trim(), source: "checkout", plan: promo ? "promo" : "anual" }),
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
      if (telefono) u.searchParams.set("phonenumber", normalizarTelefono(telefono) ?? telefono.replace(/\D/g, ""));
      return u.toString();
    } catch {
      return base;
    }
  }

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
          <h3 className="mb-2 text-2xl font-semibold tracking-tight">{nombre ? `${nombre.split(" ")[0]}, elegí cómo entrar` : "Elegí cómo entrar"}</h3>
          {promo && (
            <div className="mb-6 rounded-2xl border border-accent/40 bg-accent/[0.07] p-4 text-center">
              <p className="text-sm font-semibold text-accent">Oferta de lanzamiento: 3 días o hasta agotar los {PRECOS.promo.vagas} cupos</p>
              <p className="mt-1 text-xs text-muted">Lo que ocurra primero. Después vuelve al precio normal.</p>
              <div className="mt-3">
                <CuentaRegresiva fin={promoFin} />
              </div>
              {vagasRestantes <= PRECOS.promo.vagas - PRECOS.promo.mostrarCuposDesde && (
                <p className="mt-3 text-sm text-ink">
                  Quedan <strong className="text-accent">{vagasRestantes}</strong> de {PRECOS.promo.vagas} cupos
                </p>
              )}
            </div>
          )}
          <p className="mb-6 text-sm text-muted">
            Pago único en todos los casos. Sin mensualidades.{" "}
            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage.removeItem(CLAVE);
                } catch {
                  /* ignorar */
                }
                setPaso("datos");
              }}
              className="text-faint underline underline-offset-2 hover:text-ink"
            >
              Cambiar mis datos
            </button>
          </p>

          <div role="radiogroup" aria-label="Elegí tu acceso" className="space-y-3">
            {opciones.map((o) => {
              const activa = eleccion === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={activa}
                  onClick={() => setEleccion(o.id)}
                  className={`relative w-full rounded-2xl border p-5 text-left transition ${
                    activa ? "border-accent/60 bg-accent/[0.08] shadow-[0_0_50px_-20px_rgba(57,255,126,.7)]" : "border-line bg-white/[0.03] hover:border-line-strong"
                  }`}
                >
                  {o.etiqueta && (
                    <span className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-black">{o.etiqueta}</span>
                  )}
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block font-medium tracking-tight">{o.nombre}</span>
                      <span className="mt-0.5 block text-xs text-faint">{o.sub}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-right">
                        <span className="block text-2xl font-semibold tracking-tight">US${o.valor}</span>
                        {o.tachado && <span className="block text-xs text-faint line-through">US${o.tachado}</span>}
                      </span>
                      <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full border ${activa ? "border-accent bg-accent" : "border-line-strong"}`}>
                        {activa && <span className="h-2 w-2 rounded-full bg-black" />}
                      </span>
                    </span>
                  </span>
                  <ul className="mt-4 space-y-1.5">
                    {o.incluye.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-sm text-muted">
                        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                        {x}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-muted">
            Por solo <strong className="text-ink">US${diferencia} más</strong> que el acceso de 1 año, tenés el curso para siempre: no volvés a pagar y recibís todas las clases y módulos que Aaron sume en el futuro.
          </p>

          <div className="mt-5">
            {hrefElegido ? (
              <a href={hrefElegido} className={`${ui.boton} w-full py-3.5`}>
                Continuar al pago · US${elegida.valor}
              </a>
            ) : (
              <span className={`${ui.boton} w-full cursor-not-allowed py-3.5 opacity-50`}>Checkout próximamente</span>
            )}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-faint">
            Recibís el acceso por email al instante. Reembolso disponible durante los primeros 7 días.
          </p>
        </div>
      )}
    </div>
  );
}
