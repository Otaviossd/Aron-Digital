import { Suspense } from "react";
import { getMemberData } from "@/lib/members";
import type { LiveActual, MensajeLive } from "@/lib/live";
import { ui } from "@/lib/ui";
import LiveSala from "@/components/live/LiveSala";

export default function LivePage() {
  return (
    <div>
      <p className={ui.etiqueta}>Clases en vivo</p>
      <Suspense fallback={<div className="mt-6 aspect-video w-full animate-pulse rounded-2xl bg-white/[0.03]" />}>
        <Sala />
      </Suspense>
    </div>
  );
}

async function Sala() {
  const { supabase, modulos, avatarUrl, nombre } = await getMemberData();
  const { data, error } = await supabase.rpc("live_actual");

  if (error) {
    return (
      <p className="mt-6 rounded-2xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
        Las clases en vivo se están activando. Volvé en unos minutos.
      </p>
    );
  }

  const live = ((Array.isArray(data) ? data[0] : null) ?? null) as LiveActual | null;
  let mensajes: MensajeLive[] = [];
  if (live?.estado === "en_vivo") {
    const { data: filas } = await supabase
      .from("live_mensajes")
      .select("id, live_id, autor_id, autor_nombre, autor_avatar, es_instructor, cuerpo, created_at")
      .eq("live_id", live.id)
      .order("id", { ascending: false })
      .limit(80);
    mensajes = ((filas ?? []) as MensajeLive[]).reverse();
  }

  return (
    <div className="mt-3">
      <LiveSala
        key={live?.id ?? "sin-live"}
        inicial={live}
        mensajes={mensajes}
        yo={{ nombre, avatar: avatarUrl }}
        moduloGrabaciones={modulos.find((m) => m.is_live)?.id ?? null}
      />
    </div>
  );
}
