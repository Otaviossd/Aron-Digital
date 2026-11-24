"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mensajeDeError, type Comentario } from "@/lib/comentarios";
import { Foto, SelloInstructor } from "./Comentarios";
import Tiempo from "./Tiempo";

type Props = {
  inicial: Comentario[];
  yo: { nombre: string; avatar: string | null };
  esAdmin: boolean;
  placeholder?: string;
  vacio?: string;
};

const POR_PAGINA = 40;
const REFRESCO_MS = 5000;

// Comunidad, en formato de chat de verdad: una sola fila cronológica (sin hilos anidados), que
// se actualiza sola cada pocos segundos, con el compositor fijo abajo del panel, como el chat en vivo.
export default function ComunidadChat({ inicial, yo, esAdmin, placeholder, vacio }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Comentario[]>(inicial);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [hayMas, setHayMas] = useState(inicial.length >= POR_PAGINA);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [nuevos, setNuevos] = useState(0);
  const [foto, setFoto] = useState<{ archivo: File; previa: string } | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const alFondo = useRef(true);
  const pendientes = useRef(0);
  const caja = useRef<HTMLTextAreaElement>(null);
  const inputFoto = useRef<HTMLInputElement>(null);

  const traer = useCallback(async () => {
    const { data, error: e } = await supabase.rpc("listar_comentarios", {
      p_tipo: "comunidad",
      p_lesson_id: null,
      p_limit: POR_PAGINA,
      p_antes: null,
    });
    if (e) return null;
    return (data ?? []) as Comentario[];
  }, [supabase]);

  const fusionar = useCallback((actual: Comentario[], frescos: Comentario[]) => {
    if (frescos.length < POR_PAGINA) return frescos; // llegó todo lo que hay
    const corte = frescos.reduce((a, b) => (a.created_at < b.created_at ? a : b)).created_at;
    const viejos = actual.filter((c) => !c.id.startsWith("tmp-") && c.created_at < corte);
    return [...viejos, ...frescos];
  }, []);

  // Se actualiza sola cada pocos segundos, sin pisar lo que se está enviando.
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden || pendientes.current > 0) return;
      const frescos = await traer();
      if (!frescos || pendientes.current > 0) return;
      setLista((actual) => {
        const fusion = fusionar(actual, frescos);
        const sumados = fusion.length - actual.filter((c) => !c.id.startsWith("tmp-")).length;
        if (sumados > 0 && !alFondo.current) setNuevos((n) => n + sumados);
        return fusion;
      });
    }, REFRESCO_MS);
    return () => clearInterval(id);
  }, [traer, fusionar]);

  // Mantiene el chat abajo mientras llegan mensajes nuevos (si subiste a leer, no te mueve solo).
  useEffect(() => {
    const el = panel.current;
    if (el && alFondo.current) el.scrollTop = el.scrollHeight;
  }, [lista]);

  const alScroll = () => {
    const el = panel.current;
    if (!el) return;
    alFondo.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (alFondo.current) setNuevos(0);
  };

  const irAbajo = () => {
    const el = panel.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setNuevos(0);
  };

  const ajustar = () => {
    const el = caja.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const elegirFoto = (archivo: File | undefined) => {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("Eso no es una imagen.");
      return;
    }
    if (archivo.size > 8 * 1024 * 1024) {
      setError("La foto es muy pesada (máximo 8 MB).");
      return;
    }
    setError(null);
    setFoto({ archivo, previa: URL.createObjectURL(archivo) });
  };

  const quitarFoto = () => {
    if (foto) URL.revokeObjectURL(foto.previa);
    setFoto(null);
    if (inputFoto.current) inputFoto.current.value = "";
  };

  const enviar = async () => {
    const limpio = texto.trim();
    if ((!limpio && !foto) || enviando || subiendoFoto) return;
    setError(null);
    setEnviando(true);
    pendientes.current += 1;

    let imagenUrl: string | null = null;
    if (foto) {
      setSubiendoFoto(true);
      const ext = foto.archivo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const ruta = `${yo.nombre.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "alumno"}/${Date.now()}.${ext}`;
      const { error: eSubida } = await supabase.storage.from("comunidad").upload(ruta, foto.archivo, { contentType: foto.archivo.type });
      setSubiendoFoto(false);
      if (eSubida) {
        pendientes.current -= 1;
        setEnviando(false);
        setError("No se pudo subir la foto. Probá de nuevo.");
        return;
      }
      imagenUrl = supabase.storage.from("comunidad").getPublicUrl(ruta).data.publicUrl;
    }

    const tmp: Comentario = {
      id: `tmp-${Date.now()}`,
      parent_id: null,
      autor_nombre: yo.nombre,
      autor_avatar: yo.avatar,
      es_instructor: false,
      es_mio: true,
      cuerpo: limpio,
      imagen_url: imagenUrl,
      fijado: false,
      created_at: new Date().toISOString(),
      likes: 0,
      yo_di_like: false,
    };
    alFondo.current = true;
    setLista((l) => [...l, tmp]);
    quitarFoto();
    const { error: e } = await supabase.rpc("publicar_comentario", {
      p_tipo: "comunidad",
      p_lesson_id: null,
      p_parent_id: null,
      p_cuerpo: limpio,
      p_nombre: yo.nombre,
      p_avatar: yo.avatar,
      p_imagen_url: imagenUrl,
    });
    pendientes.current -= 1;
    setEnviando(false);
    if (e) {
      setLista((l) => l.filter((c) => c.id !== tmp.id));
      setError(mensajeDeError(e.message));
      return;
    }
    setTexto("");
    requestAnimationFrame(ajustar);
    const frescos = await traer();
    if (frescos) setLista((actual) => fusionar(actual.filter((c) => c.id !== tmp.id), frescos));
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
    setLista((l) => l.filter((x) => x.id !== c.id));
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

  const cargarAnteriores = async () => {
    if (lista.length === 0) return;
    setCargandoMas(true);
    const el = panel.current;
    const alturaAntes = el?.scrollHeight ?? 0;
    const { data } = await supabase.rpc("listar_comentarios", {
      p_tipo: "comunidad",
      p_lesson_id: null,
      p_limit: POR_PAGINA,
      p_antes: lista[0]?.created_at ?? null,
    });
    setCargandoMas(false);
    const mas = (data ?? []) as Comentario[];
    if (mas.length === 0) {
      setHayMas(false);
      return;
    }
    setLista((l) => {
      const ids = new Set(l.map((c) => c.id));
      return [...mas.filter((c) => !ids.has(c.id)), ...l];
    });
    setHayMas(mas.length >= POR_PAGINA);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - alturaAntes;
    });
  };

  return (
    <div className="flex h-[34rem] min-h-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface sm:h-[38rem] lg:h-[44rem]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-sm font-semibold tracking-tight">Chat de la comunidad</p>
          <p className="text-xs text-faint">{lista.length === 0 ? "Sé el primero en escribir" : `${lista.length} ${lista.length === 1 ? "mensaje" : "mensajes"}`}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          En vivo
        </span>
      </div>

      <div ref={panel} onScroll={alScroll} className="relative min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6" aria-live="polite">
        {hayMas && (
          <div className="pb-1 text-center">
            <button type="button" onClick={() => void cargarAnteriores()} disabled={cargandoMas} className="rounded-full border border-line-strong px-4 py-1.5 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-ink disabled:opacity-50">
              {cargandoMas ? "Cargando…" : "Ver mensajes anteriores"}
            </button>
          </div>
        )}

        {lista.length === 0 && <p className="py-14 text-center text-sm text-faint">{vacio ?? "Sé la primera persona en escribir."}</p>}

        {lista.map((c) => (
          <div key={c.id} className={`group flex min-w-0 gap-2.5 sm:gap-3 ${c.id.startsWith("tmp-") ? "opacity-60" : ""}`}>
            <Foto nombre={c.autor_nombre} url={c.autor_avatar} size={36} instructor={c.es_instructor} />
            <div className="min-w-0 flex-1">
              {c.es_instructor && (
                <p className="mb-1 pl-1 text-[11px] font-semibold uppercase tracking-wide text-accent">↳ Responde el instructor</p>
              )}
              <div
                className={`min-w-0 overflow-hidden rounded-2xl rounded-tl-sm px-4 py-2.5 ${
                  c.es_instructor ? "border border-accent/40 bg-accent/[0.14] shadow-[0_0_0_1px_rgba(0,0,0,0.02)]" : c.es_mio ? "bg-accent/[0.07]" : "bg-white/[0.05]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className={`text-sm font-semibold tracking-tight ${c.es_instructor ? "text-accent" : ""}`}>{c.autor_nombre}</span>
                  {c.es_instructor && <SelloInstructor />}
                  {c.fijado && <span className="text-[11px] font-medium text-faint">📌</span>}
                </div>
                {c.cuerpo && <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink/90">{c.cuerpo}</p>}
                {c.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imagen_url}
                    alt="Foto enviada en la comunidad"
                    className={`max-h-80 w-full max-w-xs cursor-zoom-in rounded-xl object-cover ${c.cuerpo ? "mt-2" : "mt-0.5"}`}
                    onClick={() => window.open(c.imagen_url!, "_blank", "noopener,noreferrer")}
                  />
                )}
              </div>
              <div className="mt-1 flex items-center gap-x-3 pl-1 text-xs text-faint">
                <Tiempo fecha={c.created_at} />
                <button
                  type="button"
                  onClick={() => void alternarLike(c)}
                  aria-pressed={c.yo_di_like}
                  aria-label={c.yo_di_like ? "Quitar me gusta" : "Me gusta"}
                  className={`-ml-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-1 transition active:scale-90 ${c.yo_di_like ? "text-[#ff3d71]" : "hover:text-ink"}`}
                >
                  <svg viewBox="0 0 24 24" className={`h-[15px] w-[15px] transition-transform ${c.yo_di_like ? "scale-110" : ""}`} fill={c.yo_di_like ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21s-7.5-4.6-9.6-9.3C.8 8 3 4.5 6.5 4.5c2 0 3.7 1.1 5.5 3.2 1.8-2.1 3.5-3.2 5.5-3.2 3.5 0 5.7 3.5 4.1 7.2C19.5 16.4 12 21 12 21z" />
                  </svg>
                  {c.likes > 0 && <span className="tabular-nums">{c.likes}</span>}
                </button>
                {esAdmin && (
                  <button type="button" onClick={() => void fijar(c)} className="opacity-0 transition hover:text-ink group-hover:opacity-100 focus:opacity-100">
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
                    <button type="button" onClick={() => setConfirmando(c.id)} className="opacity-0 transition hover:text-red-300 group-hover:opacity-100 focus:opacity-100">
                      Eliminar
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nuevos > 0 && (
        <button type="button" onClick={irAbajo} className="neon mx-auto -mt-11 mb-3 rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg">
          {nuevos} {nuevos === 1 ? "mensaje nuevo" : "mensajes nuevos"} ↓
        </button>
      )}

      <div className="border-t border-line p-3 sm:p-4">
        {error && (
          <p role="alert" className="mb-2 text-xs text-red-300">
            {error}
          </p>
        )}
        {foto && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.previa} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <p className="flex-1 truncate text-xs text-faint">{subiendoFoto ? "Subiendo foto…" : foto.archivo.name}</p>
            <button type="button" onClick={quitarFoto} className="px-1 text-xs font-medium text-faint hover:text-red-300">
              Quitar
            </button>
          </div>
        )}
        <div className="flex items-end gap-2.5">
          <Foto nombre={yo.nombre} url={yo.avatar} size={34} />
          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => elegirFoto(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputFoto.current?.click()}
            aria-label="Adjuntar foto de corte"
            title="Mandar una foto de corte"
            className="mb-[3px] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-faint transition hover:border-accent/50 hover:text-accent"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="15" rx="2.5" />
              <circle cx="8.5" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
              <path d="m4 17 5-5 4 4 3-3 4 4" />
            </svg>
          </button>
          <textarea
            ref={caja}
            value={texto}
            rows={1}
            maxLength={2000}
            placeholder={placeholder ?? "Escribí algo, o mandá una foto de tu corte…"}
            aria-label="Mensaje para la comunidad"
            onChange={(e) => {
              setTexto(e.target.value);
              ajustar();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar();
              }
            }}
            className="min-w-0 flex-1 resize-none rounded-2xl border border-line bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-faint focus:border-white/35"
          />
          <button
            type="button"
            onClick={() => void enviar()}
            disabled={(!texto.trim() && !foto) || enviando || subiendoFoto}
            aria-label="Enviar mensaje"
            className="neon flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-[1px]" fill="currentColor" aria-hidden="true">
              <path d="M3.4 20.6 21 12 3.4 3.4 3 10l12 2-12 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 pl-1 text-[11px] text-faint">Enter para enviar · Shift+Enter para salto de línea · 📷 para mandar una foto</p>
      </div>
    </div>
  );
}
