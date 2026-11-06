// A diferencia del layout, el template se vuelve a montar en cada navegación: así cada pantalla entra con una animación suave.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="entra">{children}</div>;
}
