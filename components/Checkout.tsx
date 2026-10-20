"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { PRECOS } from "@/lib/config";
import { enviarEvento } from "@/components/Rastreo";

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

  // E-mail pré-preenchido pelo link dos e-mails de carrinho abandonado (?email=...)
  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("email");
    if (e) setEmail(e);
  }, []);

  // Guarda o e-mail como lead quando a pessoa termina de digitar (uma vez por e-mail)
  const ultimoLead = useRef("");
  useEffect(() => {
    if (!emailValido) return;
    const limpio = email.trim().toLowerCase();
    if (limpio === ultimoLead.current) return;
    const t = setTimeout(() => {
      // Passo do funil: chegou ao checkout (uma vez por abertura da página)
      if (!ultimoLead.current) enviarEvento("/ventas", "checkout");
      ultimoLead.current = limpio;
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: limpio, plan, source: "checkout" }),
      }).catch(() => {});
    }, 900);
    return () => clearTimeout(t);
  }, [email, emailValido, plan]);

  useEffect(() => {
    if (!sdkListo || !window.paypal || !contenedor.current || !emailValido) return;
    const el = contenedor.current;
    el.innerHTML = "";
    const botones = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "pill", label: "subscribe" },
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
    <div id="comprar" className="scroll-mt-8 rounded-3xl border border-line bg-surface p-6 sm:p-8">
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
            className={`rounded-2xl border p-4 text-left transition ${
              plan === p ? "border-ink bg-ink text-bg" : "border-line hover:border-line-strong"
            }`}
          >
            <span className={`block text-xs font-medium ${plan === p ? "text-bg/60" : "text-muted"}`}>{PRECOS[p].rotulo}</span>
            <span className="mt-1 block text-3xl font-semibold tracking-tight">US${PRECOS[p].valor}</span>
            <span className={`mt-1 block text-xs leading-snug ${plan === p ? "text-bg/60" : "text-faint"}`}>{PRECOS[p].detalle}</span>
          </button>
        ))}
      </div>

      <label htmlFor="email-checkout" className="mb-1.5 block text-xs font-medium text-muted">
        Tu email de acceso
      </label>
      <input
        id="email-checkout"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="mb-2 w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3.5 text-base outline-none transition placeholder:text-faint focus:border-white/35"
      />
      <p className="mb-5 text-[11px] leading-relaxed text-faint">
        Al continuar aceptás que usemos tu email para enviarte el acceso y novedades del curso. Podés darte de baja
        cuando quieras.
      </p>

      {emailValido ? (
        <div ref={contenedor} />
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong p-4 text-center text-sm text-faint">
          Escribí tu email para habilitar el pago
        </p>
      )}

      {!clientId && (
        <p className="mt-4 text-xs text-red-300">Falta configurar NEXT_PUBLIC_PAYPAL_CLIENT_ID (ver .env.example).</p>
      )}

      <p className="mt-5 text-xs leading-relaxed text-faint">
        Recibís el acceso por email al instante. Podés cancelar cuando quieras desde tu cuenta. Reembolso disponible
        solo durante los primeros 7 días.
      </p>
    </div>
  );
}
