"use client";

import { useEffect, useState } from "react";
import { ui } from "@/lib/ui";

// Barra fija con el botón de compra, solo en el celular. Se muestra al bajar y se esconde cuando ya se ve la oferta.
export default function BarraMovil({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let pasoHero = false;
    let oferta = false;
    const actualizar = () => setVisible(pasoHero && !oferta);
    const onScroll = () => {
      pasoHero = window.scrollY > 700;
      actualizar();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const el = document.getElementById("comprar");
    const obs = el
      ? new IntersectionObserver(([e]) => {
          oferta = e.isIntersecting;
          actualizar();
        })
      : null;
    if (el) obs?.observe(el);
    return () => {
      window.removeEventListener("scroll", onScroll);
      obs?.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-3 transition duration-300 md:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
      aria-hidden={!visible}
    >
      <a href="#comprar" tabIndex={visible ? 0 : -1} className={`${ui.boton} w-full py-3.5 shadow-[0_-10px_40px_-10px_rgba(0,0,0,.9)]`}>
        {texto}
      </a>
    </div>
  );
}
