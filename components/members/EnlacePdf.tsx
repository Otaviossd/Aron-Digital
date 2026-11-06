// Descarga del certificado: es una ruta que devuelve un archivo (no una página), por eso va con <a> normal.
export default function EnlacePdf({ demo = false, className, children }: { demo?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <a href={demo ? "/aulas/certificado/pdf?demo=1" : "/aulas/certificado/pdf"} className={className}>
      {children}
    </a>
  );
}
