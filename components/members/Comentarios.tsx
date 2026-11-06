"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { armarHilos, iniciales, mensajeDeError, type Comentario } from "@/lib/comentarios";
import Tiempo from "./Tiempo";

type Props = {
  tipo: "aula" | "comunidad";
  lessonId?: string;
  inicial: Comentario[];
  yo: { nombre: string; avatar: string | null };
  esAdmin: boolean;
  placeholder?: string;
  vacio?: string;
};

const POR_PAGINA = 30;

// Junta la página más reciente que llegó del servidor con lo que ya se cargó con "Ver anteriores".
function mezclar(actual: Comentario[], nuevos: Comentario[]) {
  const principales = nuevos.filter((c) => !c.parent_id);
  if (principales.length < POR_PAGINA) return nuevos; // llegó todo
  const corte = principales.reduce((a, b) => (a.created_at < b.created_at ? a : b)).created_at;
  const viejos = actual.filter((c) => !c.parent_id && !c.id.startsWith("tmp-") && c.created_at < corte);
  const ids = new Set(viejos.map((c) => c.id));
  const respuestas = actual.filter((c) => c.parent_id && ids.has(c.parent_id));
  return [...viejos, ...respuestas, ...nuevos];
}

export function Foto({ nombre, url, size = 36, instructor = false }: { nombre: string; url: string | null; size?: number; instructor?: boolean }) {
  const medida = { width: size, height: size };
  const anillo = instructor ? "ring-2 ring-accent/80 ring-offset-2 ring-offset-bg" : "border border-line-strong";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={medida} className={`shrink-0 rounded-full object-cover ${anillo}`} />
  ) : (
    <span
      style={{ ...medida, fontSize: size * 0.36 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/[0.07] font-semibold text-ink/80 ${anillo}`}
    >
      {iniciales(nombre)}
    </span>
  );
}

// Sello de verificado, como en Instagram.
export function SelloInstructor({ chico = false }: { chico?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent/15 font-semibold text-accent ${chico ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-[11px]"}`}
      title="Instructor verificado"
    >
      <svg viewBox="0 0 24 24" className={chico ? "h-3 w-3" : "h-3.5 w-3.5"} fill="currentColor" aria-hidden="true">
        <path d="M12 1.8l2.4 1.9 3-.1 1.2 2.8 2.7 1.4-.5 3 1.5 2.6-2 2.3-.2 3-2.9.9-1.7 2.5-2.9-.9-2.9.9-1.7-2.5-2.9-.9-.2-3-2-2.3 1.5-2.6-.5-3L5.4 6.4l1.2-2.8 3 .1L12 1.8z" />
        <path d="M8.2 12.4l2.5 2.5 5-5.3" fill="none" stroke="#04120a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Instructor
    </span>
  );
}

function Corazon({ lleno }: { lleno: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] transition-transform duration-200 ${lleno ? "scale-110" : ""}`} fill={lleno ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.3C.8 8 3 4.5 6.5 4.5c2 0 3.7 1.1 5.5 3.2 1.8-2.1 3.5-3.2 5.5-3.2 3.5 0 5.7 3.5 4.1 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function Compositor({
  yo,
  placeholder,
  etiqueta,
  enviando,
  autoFoco,
  onEnviar,
  onCancelar,
}: {
  yo: Props["yo"];
  placeholder: string;
  etiqueta: string;
  enviando: boolean;
  autoFoco?: boolean;
  onEnviar: (texto: string) => Promise<boolean>;
  onCancelar?: () => void;
}) {
  const [texto, setTexto] = useState("");
  const caja = useRef<HTMLTextAreaElement>(null);

  const ajustar = () => {
    const el = caja.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  };

  const enviar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    const ok = await onEnviar(limpio);
    if (ok) {
      setTexto("");
      requestAnimationFrame(ajustar);
    }
  };

  return (
    <div className="flex gap-3">
      <Foto nombre={yo.nombre} url={yo.avatar} size={36} />
      <div className="min-w-0 flex-1">
        <textarea
          ref={caja}
          value={texto}
          autoFocus={autoFoco}
          rows={1}
          maxLength={2000}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => {
            setTexto(e.target.value);
            ajustar();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void enviar();
            }
          }}
          className="block w-full resize-none rounded-2xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-faint focus:border-white/35"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          {onCancelar && (
            <button type="button" onClick={onCancelar} className="rounded-full px-3 py-1.5 text-xs text-muted transition hover:text-ink">
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={() => void enviar()}
            disabled={!texto.trim() || enviando}
            className="neon rounded-full px-5 py-2 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enviando ? "Enviando…" : etiqueta}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Comentarios({ tipo, lessonId, inicial, yo, esAdmin, placeholder, vacio }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Comentario[]>(inicial);
  const [respondiendo, setRespondiendo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [hayMas, setHayMas] = useState(inicial.filter((c) => !c.parent_id).length >= POR_PAGINA);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const pendientes = useRef(0);

  const hilos = useMemo(() => armarHilos(lista), [lista]);
  const total = lista.length;

  const traer = useCallback(
    async (antes?: string) => {
      const { data, error: e } = await supabase.rpc("listar_comentarios", {
        p_tipo: tipo,
        p_lesson_id: lessonId ?? null,
        p_limit: POR_PAGINA,
        p_antes: antes ?? null,
      });
      if (e) return null;
      return (data ?? []) as Comentario[];
    },
    [supabase, tipo, lessonId],
  );

  // Se actualiza solo: cada 20 s mientras la pestaña está visible, sin pisar lo que se está enviando.
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden || pendientes.current > 0) return;
      const nuevos = await traer();
      if (!nuevos || pendientes.current > 0) return;
      setLista((actual) => mezclar(actual, nuevos));
    }, 20000);
    return () => clearInterval(id);
  }, [traer]);

  const recargar = useCallback(async () => {
    const nuevos = await traer();
    if (!nuevos) return;
    setLista((actual) => mezclar(actual, nuevos));
  }, [traer]);

  const publicar = async (cuerpo: string, parentId: string | null) => {
    setError(null);
    setEnviando(true);
    pendientes.current += 1;
    const tmp: Comentario = {
      id: `tmp-${Date.now()}`,
      parent_id: parentId,
      autor_nombre: yo.nombre,
      autor_avatar: yo.avatar,
      es_instructor: false,
      es_mio: true,
      cuerpo,
      fijado: false,
      created_at: new Date().toISOString(),
      likes: 0,
      yo_di_like: false,
    };
    setLista((l) => [...l, tmp]);
    if (parentId) setExpandidos((s) => new Set(s).add(parentId));
    const { error: e } = await supabase.rpc("publicar_comentario", {
      p_tipo: tipo,
      p_lesson_id: lessonId ?? null,
      p_parent_id: parentId,
      p_cuerpo: cuerpo,
      p_nombre: yo.nombre,
      p_avatar: yo.avatar,
    });
    pendientes.current -= 1;
    setEnviando(false);
    if (e) {
      setLista((l) => l.filter((c) => c.id !== tmp.id));
      setError(mensajeDeError(e.message));
      return false;
    }
    setLista((l) => l.filter((c) => c.id !== tmp.id));
    await recargar();
    setRespondiendo(null);
    return true;
  };

  const alternarLike = async (c: Comentario) => {
    if (c.id.startsWith("tmp-")) return;
    const aplicar = (dar: boolean) => setLista((l) => l.map((x) => (x.id === c.id ? { ...x, yo_di_like: dar, likes: Math.max(0, x.likes + (dar ? 1 : -1)) } : x)));
    aplicar(!c.yo_di_like);
    const { error: e } = await supabase.rpc("alternar_like", { p_comentario_id: c.id });
    if (e) aplicar(c.yo_di_like);
  };

  const borrar = async (c: Comentario) => {
    setConfirmando(null);
    const respaldo = lista;
    setLista((l) => l.filter((x) => x.id !== c.id && x.parent_id !== c.id));
    const { error: e } = await supabase.rpc("borrar_comentario", { p_id: c.id });
    if (e) {
      setLista(respaldo);
      setError("No se pudo eliminar.");
    }
  };

  const fijar = async (c: Comentario) => {
    setLista((l) => l.map((x) => (x.id === c.id ? { ...x, fijado: !c.fijado } : x)));
    const { error: e } = await supabase.rpc("fijar_comentario", { p_id: c.id, p_fijado: !c.fijado });
    if (e) setLista((l) => l.map((x) => (x.id === c.id ? { ...x, fijado: c.fijado } : x)));
  };

  const verMas = async () => {
    const principales = lista.filter((c) => !c.parent_id && !c.id.startsWith("tmp-"));
    if (principales.length === 0) return;
    const masViejo = principales.reduce((a, b) => (a.created_at < b.created_at ? a : b));
    setCargandoMas(true);
    const mas = await traer(masViejo.created_at);
    setCargandoMas(false);
    if (!mas) return;
    setLista((l) => {
      const ids = new Set(l.map((c) => c.id));
      return [...l, ...mas.filter((c) => !ids.has(c.id))];
    });
    setHayMas(mas.filter((c) => !c.parent_id).length >= POR_PAGINA);
  };

  const verAcciones = (c: Comentario, principal: boolean) => (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
      <button
        type="button"
        onClick={() => void alternarLike(c)}
        aria-pressed={c.yo_di_like}
        aria-label={c.yo_di_like ? "Quitar me gusta" : "Me gusta"}
        className={`-ml-1 inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 transition active:scale-90 ${c.yo_di_like ? "text-[#ff3d71]" : "hover:text-ink"}`}
      >
        <Corazon lleno={c.yo_di_like} />
        {c.likes > 0 && <span className="tabular-nums">{c.likes}</span>}
      </button>
      {principal && (
        <button type="button" onClick={() => setRespondiendo(respondiendo === c.id ? null : c.id)} className="transition hover:text-ink">
          Responder
        </button>
      )}
      {esAdmin && principal && (
        <button type="button" onClick={() => void fijar(c)} className="transition hover:text-ink">
          {c.fijado ? "Desfijar" : "Fijar"}
        </button>
      )}
      {(c.es_mio || esAdmin) &&
        (confirmando === c.id ? (
          <span className="inline-flex items-center gap-2">
            <span className="text-red-300">¿Eliminar?</span>
            <button type="button" onClick={() => void borrar(c)} className="font-medium text-red-300 hover:text-red-200">
              Sí
            </button>
            <button type="button" onClick={() => setConfirmando(null)} className="hover:text-ink">
              No
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmando(c.id)} className="transition hover:text-red-300">
            Eliminar
          </button>
        ))}
    </div>
  );

  const verComentario = (c: Comentario, chico?: boolean) => (
    <div className={`flex gap-3 ${c.id.startsWith("tmp-") ? "opacity-60" : ""}`}>
      <Foto nombre={c.autor_nombre} url={c.autor_avatar} size={chico ? 30 : 38} instructor={c.es_instructor} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold tracking-tight">{c.autor_nombre}</span>
          {c.es_instructor && <SelloInstructor chico />}
          {c.fijado && <span className="text-[11px] font-medium text-faint">📌 Fijado</span>}
          <Tiempo fecha={c.created_at} />
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/90">{c.cuerpo}</p>
        {verAcciones(c, !c.parent_id)}
      </div>
    </div>
  );

  return (
    <div>
      <Compositor
        yo={yo}
        placeholder={placeholder ?? "Escribí tu pregunta o comentario…"}
        etiqueta="Publicar"
        enviando={enviando && respondiendo === null}
        onEnviar={(t) => publicar(t, null)}
      />
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-2.5 text-xs text-red-200">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between border-b border-line pb-3 text-xs text-faint">
        <span>
          {total === 0 ? "Sin comentarios todavía" : `${hilos.length} ${hilos.length === 1 ? "conversación" : "conversaciones"}`}
        </span>
        <span>Se actualiza solo</span>
      </div>

      {hilos.length === 0 ? (
        <p className="py-14 text-center text-sm text-faint">{vacio ?? "Sé la primera persona en comentar."}</p>
      ) : (
        <ul className="divide-y divide-line">
          {hilos.map((h) => {
            const abierto = expandidos.has(h.id) || h.respuestas.length <= 2;
            const visibles = abierto ? h.respuestas : h.respuestas.slice(-1);
            return (
              <li key={h.id} className={`py-5 ${h.es_instructor ? "-mx-3 rounded-2xl bg-accent/[0.04] px-3" : ""}`}>
                {verComentario(h)}
                {(h.respuestas.length > 0 || respondiendo === h.id) && (
                  <div className="ml-[50px] mt-4 space-y-4 border-l border-line pl-4">
                    {!abierto && (
                      <button type="button" onClick={() => setExpandidos((s) => new Set(s).add(h.id))} className="text-xs font-medium text-muted transition hover:text-ink">
                        Ver las {h.respuestas.length - visibles.length} respuestas anteriores
                      </button>
                    )}
                    {visibles.map((r) => (
                      <div key={r.id}>{verComentario(r, true)}</div>
                    ))}
                    {respondiendo === h.id && (
                      <Compositor
                        yo={yo}
                        autoFoco
                        placeholder={`Responder a ${h.autor_nombre}…`}
                        etiqueta="Responder"
                        enviando={enviando}
                        onEnviar={(t) => publicar(t, h.id)}
                        onCancelar={() => setRespondiendo(null)}
                      />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hayMas && (
        <div className="pt-4 text-center">
          <button type="button" onClick={() => void verMas()} disabled={cargandoMas} className="rounded-full border border-line-strong px-5 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-ink disabled:opacity-50">
            {cargandoMas ? "Cargando…" : "Ver comentarios anteriores"}
          </button>
        </div>
      )}
    </div>
  );
}
