import type { CSSProperties } from "react";

// Fotos del Aaron guardadas en /public/aaron (ver LEEME.txt). Para cambiar la foto de una página,
// cambia el archivo aquí. Si un archivo falta, el sitio muestra solo el degradé oscuro.
export const FOTOS = {
  retrato: "/aaron/retrato.jpg",
  espalda: "/aaron/espalda.jpg",
  auditorio: "/aaron/auditorio.jpg",
  clase: "/aaron/clase.jpg",
  // Uso por página:
  hero: "/aaron/auditorio.jpg", // página de venta, topo
  captura: "/aaron/retrato.jpg", // página de captura (lista de espera)
  sobre: "/aaron/clase.jpg", // sección "Quién es Aaron"
  entrar: "/aaron/espalda.jpg", // pantalla de acceso
  aulas: "/aaron/auditorio.jpg", // portada del área del alumno
} as const;

// Fotos que se rotan como fondo de las portadas de módulo que no tienen imagen propia.
export const FOTOS_PORTADA = [FOTOS.retrato, FOTOS.clase, FOTOS.espalda, FOTOS.auditorio];

// Foto de fondo con un véu escuro por cima para o texto ficar legível.
export function fondoFoto(
  src: string,
  veu = "linear-gradient(90deg, rgba(10,10,10,.92) 0%, rgba(10,10,10,.6) 55%, rgba(10,10,10,.25) 100%)",
  posicion = "center",
): CSSProperties {
  return {
    backgroundImage: `${veu}, url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: posicion,
  };
}
