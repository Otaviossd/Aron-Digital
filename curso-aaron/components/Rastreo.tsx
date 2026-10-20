"use client";

import { useEffect } from "react";

type Paso = "view" | "lead" | "checkout";

function leer(clave: string, almacen: "local" | "session") {
  try {
    return (almacen === "local" ? localStorage : sessionStorage).getItem(clave);
  } catch {
    return null;
  }
}
function guardar(clave: string, valor: string, almacen: "local" | "session") {
  try {
    (almacen === "local" ? localStorage : sessionStorage).setItem(clave, valor);
  } catch {
    /* navegador sin almacenamiento: seguimos sin guardar */
  }
}

// Origem da visita: utm_source (ou ref) do link, senão o domínio de quem indicou. Fica fixa na sessão.
function origen() {
  const guardado = leer("src", "session");
  if (guardado !== null) return guardado;
  const q = new URLSearchParams(window.location.search);
  let fuente = (q.get("utm_source") || q.get("ref") || "").trim().toLowerCase();
  if (!fuente && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host !== window.location.hostname) fuente = host;
    } catch {
      /* referrer inválido */
    }
  }
  guardar("src", fuente, "session");
  return fuente;
}

// Para o time não inflar os números: abra qualquer página com ?rastreo=off uma vez em cada navegador.
function silenciado() {
  const q = new URLSearchParams(window.location.search).get("rastreo");
  if (q === "off") guardar("rastreo-off", "1", "local");
  if (q === "on") {
    try {
      localStorage.removeItem("rastreo-off");
    } catch {
      /* ignora */
    }
  }
  return leer("rastreo-off", "local") === "1";
}

export function enviarEvento(path: string, kind: Paso) {
  try {
    if (silenciado()) return;
    let v = leer("vid", "local");
    if (!v) {
      v = crypto.randomUUID();
      guardar("vid", v, "local");
    }
    const cuerpo = JSON.stringify({ v, path, kind, source: origen() });
    fetch("/api/evento", { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo, keepalive: true }).catch(() => {});
  } catch {
    /* o rastreio nunca pode atrapalhar a página */
  }
}

// Registra a visita à página uma vez por abertura.
export default function Rastreo({ path }: { path: string }) {
  useEffect(() => {
    enviarEvento(path, "view");
  }, [path]);
  return null;
}
