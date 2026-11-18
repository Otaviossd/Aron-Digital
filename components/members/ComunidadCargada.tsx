import { getMemberData } from "@/lib/members";
import type { Comentario } from "@/lib/comentarios";
import ComunidadChat from "./ComunidadChat";

// Trae los mensajes de la comunidad en el servidor (aparecen con la página, sin pantalla de carga).
export default async function ComunidadCargada() {
  const { supabase, esAdmin, avatarUrl, nombre } = await getMemberData();
  const { data, error } = await supabase.rpc("listar_comentarios", {
    p_tipo: "comunidad",
    p_lesson_id: null,
    p_limit: 40,
    p_antes: null,
  });

  if (error) {
    return (
      <p className="rounded-2xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
        Esta sección se está activando. Volvé en unos minutos.
      </p>
    );
  }

  return <ComunidadChat inicial={(data ?? []) as Comentario[]} yo={{ nombre, avatar: avatarUrl }} esAdmin={esAdmin} />;
}
