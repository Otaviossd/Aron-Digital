"use client";

import { useEffect, useState } from "react";
import { ui } from "@/lib/ui";

// Barra fija con el botón de compra, solo en el celular. Aparece al bajar del inicio y se esconde en cuanto
// se ve el cuadro de la oferta (#comprar), para no tapar sus botones.
export default function BarraMovil({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let espera = false;
    const calcular = () => {
      espera = false;
      // Se busca el cuadro en cada medición: el contenido de la oferta cambia de paso y se vuelve a dibujar.
      const el = document.getElementById("comprar");
      const r = el?.getBoundingClientRect();
      const ofertaALaVista = Boolean(r && r.top < window.innerHeight * 0.92 && r.bottom > 80);
      setVisible(window.scrollY > 700 && !ofertaALaVista);
    };
    const onScroll = () => {
      if (!espera) {
        espera = true;
        requestAnimationFrame(calcular);
      }
    };
    calcular();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function ir(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("comprar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-3 transition duration-300 md:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
      aria-hidden={!visible}
    >
      <a href="#comprar" onClick={ir} tabIndex={visible ? 0 : -1} className={`${ui.boton} w-full py-3.5 shadow-[0_-10px_40px_-10px_rgba(0,0,0,.9)]`}>
        {texto}
      </a>
    </div>
  );
}
