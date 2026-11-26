// Ayudante para disparar eventos del Pixel de Meta desde cualquier componente cliente.
// Nunca debe romper la página: si el pixel no cargó (bloqueado, offline, etc.), se ignora.
type Fbq = (...args: unknown[]) => void;

export function fbTrack(evento: string, params?: Record<string, unknown>) {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (fbq) fbq("track", evento, params);
  } catch {
    /* el pixel nunca puede romper la página */
  }
}
