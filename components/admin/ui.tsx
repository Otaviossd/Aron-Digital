import type { ReactNode } from "react";

export function Titulo({ titulo, sub, derecha }: { titulo: string; sub?: string; derecha?: ReactNode }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
        {sub && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{sub}</p>}
      </div>
      {derecha}
    </header>
  );
}

export function Seccion({ titulo, sub, children }: { titulo: string; sub?: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight">{titulo}</h2>
        {sub && <p className="mt-1 text-sm text-faint">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

export function Dato({ valor, etiqueta, nota }: { valor: string | number; etiqueta: string; nota?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-3xl font-semibold tracking-tight tabular-nums">{valor}</p>
      <p className="mt-1.5 text-sm text-muted">{etiqueta}</p>
      {nota && <p className="mt-1 text-xs text-faint">{nota}</p>}
    </div>
  );
}

export function Pildora({ tono = "neutro", children }: { tono?: "ok" | "aviso" | "neutro" | "error"; children: ReactNode }) {
  const clase = {
    ok: "bg-emerald-400/10 text-emerald-300",
    aviso: "bg-amber-400/10 text-amber-300",
    error: "bg-red-400/10 text-red-300",
    neutro: "bg-white/[0.06] text-muted",
  }[tono];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${clase}`}>{children}</span>;
}

export function Tabla({ cabeceras, children }: { cabeceras: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-faint">
          <tr>
            {cabeceras.map((c) => (
              <th key={c} className="px-4 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line-strong p-6 text-sm text-faint">{children}</p>;
}
