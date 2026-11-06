import { getMemberData } from "@/lib/members";
import type { Comentario } from "@/lib/comentarios";
import Comentarios from "./Comentarios";

// Trae los comentarios en el servidor (aparecen con la página, sin pantalla de carga) y arma la zona interactiva.
export default async function ComentariosCargados({
  tipo,
  lessonId,
  placeholder,
  vacio,
}: {
  tipo: "aula" | "comunidad";
  lessonId?: string;
  placeholder?: string;
  vacio?: string;
}) {
  const { supabase, esAdmin, avatarUrl, nombre } = await getMemberData();
  const { data, error } = await supabase.rpc("listar_comentarios", {
    p_tipo: tipo,
    p_lesson_id: lessonId ?? null,
    p_limit: 30,
    p_antes: null,
  });

  if (error) {
    return (
      <p className="rounded-2xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
        Esta sección se está activando. Volvé en unos minutos.
      </p>
    );
  }

  return (
    <Comentarios
      tipo={tipo}
      lessonId={lessonId}
      inicial={(data ?? []) as Comentario[]}
      yo={{ nombre, avatar: avatarUrl }}
      esAdmin={esAdmin}
      placeholder={placeholder}
      vacio={vacio}
    />
  );
}
