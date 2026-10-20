// Classes de interface compartilhadas (um só lugar para manter o visual consistente).
// Regras do visual: fonte Inter, texto em caixa normal, pesos 400 a 600, cantos arredondados,
// bordas finas e uma única cor de destaque usada com parcimônia.

export const ui = {
  boton:
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50",
  botonSuave:
    "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium text-ink transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50",
  botonChico:
    "inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-xs font-medium text-bg transition hover:bg-white/85",
  botonPeligro:
    "inline-flex items-center justify-center rounded-full border border-red-400/30 px-4 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10",
  campo:
    "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none transition placeholder:text-faint focus:border-white/35",
  rotulo: "mb-1.5 block text-xs font-medium text-muted",
  tarjeta: "rounded-2xl border border-line bg-surface",
  etiqueta: "text-sm font-medium text-accent",
  titulo: "font-semibold tracking-tight",
} as const;
