"use client";

import Link from "next/link";

// Para el video/iframe de la clase actual antes de navegar a otra clase, así no sigue sonando
// de fondo después de que el alumno ya se fue de la página.
function detenerReproductor() {
  const el = document.getElementById("reproductor-clase");
  if (!el) return;
  if (el instanceof HTMLVideoElement) {
    el.pause();
  } else if (el instanceof HTMLIFrameElement) {
    el.src = "about:blank";
  }
}

export default function BotonDetenerYNavegar({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={detenerReproductor}>
      {children}
    </Link>
  );
}
