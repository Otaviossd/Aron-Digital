"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mensajeDeError } from "@/lib/comentarios";
import type { MensajeLive } from "@/lib/live";
import { Foto, SelloInstructor } from "@/components/members/Comentarios";

type Props = {
  liveId: string;
  inicial: MensajeLive[];
  yo: { nombre: string; avatar: string | null };
  // El equipo puede borrar mensajes y ve cuánta gente hay conectada
  admin?: boolean;
  onEspectadores?: (n: number) => void;
  className?: string;
};

const MAX_MENSAJES = 300;

// Chat en directo: llega al instante por Realtime y, si esa conexión falla, se refresca solo cada pocos segundos.
export default function LiveChat({ liveId, inicial, yo, admin = false, onEspectadores, className = "" }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [mensajes, setMensajes] = useState<MensajeLive[]>(inicial);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevos, setNuevos] = useState(0);
  const [conectado, setConectado] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const alFondo = useRef(true);
  const ultimoId = useRef(inicial.length ? inicial[inicial.length - 1].id : 0);

  const agregar = useCallback((nuevosMensajes: MensajeLive[]) => {
    if (nuevosMensajes.length === 0) return;
    setMensajes((actual) => {
      const ids = new Set(actual.map((m) => m.id));
      const sumar = nuevosMensajes.filter((m) => !ids.has(m.id));
      if (sumar.length === 0) return actual;
      if (!alFondo.current) setNuevos((n) => n + sumar.length);
      const todos = [...actual, ...sumar].sort((a, b) => a.id - b.id);
      return todos.slice(-MAX_MENSAJES);
    });
  }, []);

  useEffect(() => {
    if (mensajes.length) ultimoId.current = mensajes[mensajes.length - 1].id;
  }, [mensajes]);

  // Tiempo real (mensajes y gente conectada).
  // Si todavía existe un canal anterior con el mismo nombre (pasa al volver rápido a la pantalla), se espera a que se cierre.
  useEffect(() => {
    const tema = `live-sala-${liveId}`;
    let cancelado = false;
    let canal: RealtimeChannel | null = null;

    void (async () => {
      const anterior = supabase.getChannels().find((c) => c.topic === `realtime:${tema}`);
      if (anterior) await supabase.removeChannel(anterior);
      if (cancelado) return;

      const clave = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random());
      const nuevo = supabase
        .channel(tema, { config: { presence: { key: clave } } })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_mensajes", filter: `live_id=eq.${liveId}` }, (p) => {
          agregar([p.new as MensajeLive]);
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "live_mensajes" }, (p) => {
          const id = (p.old as { id?: number }).id;
          if (id) setMensajes((actual) => actual.filter((m) => m.id !== id));
        })
        .on("presence", { event: "sync" }, () => {
          onEspectadores?.(Object.keys(nuevo.presenceState()).length);
        })
        .subscribe((estado) => {
          setConectado(estado === "SUBSCRIBED");
          if (estado === "SUBSCRIBED") void nuevo.track(admin ? { equipo: true } : { en: Date.now() });
        });
      canal = nuevo;
    })();

    return () => {
      cancelado = true;
      if (canal) void supabase.removeChannel(canal);
    };
  }, [supabase, liveId, agregar, admin, onEspectadores]);

  // Respaldo: si Realtime no está conectado se consulta cada 3 s; conectado, cada 15 s por si se perdió algo.
  useEffect(() => {
    const id = setInterval(
      async () => {
        if (document.hidden) return;
        const { data } = await supabase
          .from("live_mensajes")
          .select("id, live_id, autor_id, autor_nombre, autor_avatar, es_instructor, cuerpo, created_at")
          .eq("live_id", liveId)
          .gt("id", ultimoId.current)
          .order("id", { ascending: true })
          .limit(100);
        agregar((data ?? []) as MensajeLive[]);
      },
      conectado ? 15000 : 3000,
    );
    return () => clearInterval(id);
  }, [supabase, liveId, conectado, agregar]);

  // Mantiene el chat abajo mientras llegan mensajes (si la persona subió a leer, no la mueve)
  useEffect(() => {
    const el = lista.current;
    if (el && alFondo.current) el.scrollTop = el.scrollHeight;
  }, [mensajes]);

  const alScroll = () => {
    const el = lista.current;
    if (!el) return;
    alFondo.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (alFondo.current) setNuevos(0);
  };

  const irAbajo = () => {
    const el = lista.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setNuevos(0);
  };

  const enviar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setError(null);
    const { data, error: e } = await supabase.rpc("enviar_mensaje_live", {
      p_live_id: liveId,
      p_cuerpo: limpio,
      p_nombre: yo.nombre,
      p_avatar: yo.avatar,
    });
    setEnviando(false);
    if (e) {
      setError(mensajeDeError(e.message));
      return;
    }
    setTexto("");
    alFondo.current = true;
    if (data) agregar([data as MensajeLive]);
  };

  const borrar = async (id: number) => {
    setMensajes((actual) => actual.filter((m) => m.id !== id));
    await supabase.from("live_mensajes").delete().eq("id", id);
  };

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface ${className}`}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-sm font-semibold tracking-tight">Chat en vivo</p>
        <span className={`flex items-center gap-1.5 text-[11px] ${conectado ? "text-accent" : "text-faint"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${conectado ? "bg-accent" : "bg-faint"}`} />
          {conectado ? "Conectado" : "Conectando…"}
        </span>
      </div>

      <div ref={lista} onScroll={alScroll} className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        {mensajes.length === 0 && <p className="py-10 text-center text-sm text-faint">Todavía no hay mensajes. Saludá y hacé tu pregunta.</p>}
        {mensajes.map((m) => (
          <div key={m.id} className={`group flex gap-2.5 ${m.es_instructor ? "rounded-xl bg-accent/[0.07] p-2 -mx-2" : ""}`}>
            <Foto nombre={m.autor_nombre} url={m.autor_avatar} size={28} instructor={m.es_instructor} />
            <p className="min-w-0 flex-1 break-words text-sm leading-snug">
              <span className="mr-1.5 inline-flex flex-wrap items-center gap-1 align-baseline font-semibold text-ink/90">
                {m.autor_nombre}
                {m.es_instructor && <SelloInstructor chico />}
              </span>
              <span className="text-ink/85">{m.cuerpo}</span>
            </p>
            {admin && (
              <button type="button" onClick={() => void borrar(m.id)} aria-label="Eliminar mensaje" className="shrink-0 self-start px-1 text-xs text-faint opacity-0 transition hover:text-red-300 group-hover:opacity-100 focus:opacity-100">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {nuevos > 0 && (
        <button type="button" onClick={irAbajo} className="neon mx-auto -mt-10 mb-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg">
          {nuevos} {nuevos === 1 ? "mensaje nuevo" : "mensajes nuevos"} ↓
        </button>
      )}

      <div className="border-t border-line p-3">
        {error && (
          <p role="alert" className="mb-2 text-xs text-red-300">
            {error}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={300}
            placeholder={admin ? "Responder como instructor…" : "Escribí tu pregunta o saludo…"}
            aria-label="Mensaje para el chat"
            className="min-w-0 flex-1 rounded-full border border-line bg-white/[0.04] px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-white/35"
          />
          <button disabled={!texto.trim() || enviando} className="neon shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition active:scale-95 disabled:opacity-40">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
