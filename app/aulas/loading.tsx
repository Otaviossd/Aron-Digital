// Se muestra al instante al cambiar de pantalla, mientras llega el contenido: la navegación nunca se siente trabada.
export default function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-6">
      <div className="esqueleto h-56 w-full sm:h-72" />
      <div className="esqueleto h-6 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="esqueleto aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}
