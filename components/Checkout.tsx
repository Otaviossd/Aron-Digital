"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { PRECOS } from "@/lib/config";

type Plan = "monthly" | "annual";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => {
        render: (el: HTMLElement) => Promise<void>;
        close?: () => Promise<void>;
      };
    };
  }
}

const PLAN_IDS: Record<Plan, string | undefined> = {
  monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_MONTHLY,
  annual: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL,
};

export default function Checkout() {
  const [plan, setPlan] = useState<Plan>("monthly");
  const [email, setEmail] = useState("");
  const [sdkListo, setSdkListo] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const emailRef = useRef(email);
  emailRef.current = email;

  const emailValido = /^\S+@\S+\.\S+$/.test(email.trim());

  useEffect(() => {
    if (!sdkListo || !window.paypal || !contenedor.current || !emailValido) return;
    const el = contenedor.current;
    el.innerHTML = "";
    const botones = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "subscribe" },
      createSubscription: (_data: unknown, actions: any) =>
        actions.subscription.create({
          plan_id: PLAN_IDS[plan],
          // O e-mail de acesso viaja junto e volta no webhook como custom_id.
          custom_id: emailRef.current.trim().toLowerCase(),
        }),
      onApprove: () => {
        window.location.href = "/gracias";
      },
    });
    botones.render(el);
    return () => {
      botones.close?.();
    };
  }, [sdkListo, plan, emailValido]);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <div id="comprar" className="border-2 border-acid p-6 sm:p-8">
      {clientId && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`}
          onLoad={() => setSdkListo(true)}
        />
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        {(Object.keys(PRECOS) as Plan[]).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`border-2 p-4 text-left transition ${
              plan === p ? "border-acid bg-acid text-black" : "border-white/30 hover:border-white"
            }`}
          >
            <span className="block text-xs font-bold uppercase tracking-widest">
              {PRECOS[p].rotulo}
            </span>
            <span className="block text-4xl font-black">US${PRECOS[p].valor}</span>
            <span className="block text-xs opacity-70">{PRECOS[p].detalle}</span>
          </button>
        ))}
      </div>

      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/60">
        Tu email de acceso
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="mb-5 w-full border-2 border-white/30 bg-transparent px-4 py-4 text-base outline-none focus:border-acid"
      />

      {emailValido ? (
        <div ref={contenedor} />
      ) : (
        <p className="border border-dashed border-white/30 p-4 text-center text-sm text-white/50">
          Escribí tu email para habilitar el pago
        </p>
      )}

      {!clientId && (
        <p className="mt-4 text-xs text-red-400">
          Falta configurar NEXT_PUBLIC_PAYPAL_CLIENT_ID (ver .env.example).
        </p>
      )}

      <p className="mt-5 text-xs leading-relaxed text-white/40">
        Recibís el acceso por email al instante. Podés cancelar cuando quieras desde tu cuenta.
        Reembolso disponible solo durante los primeros 7 días.
      </p>
    </div>
  );
}
