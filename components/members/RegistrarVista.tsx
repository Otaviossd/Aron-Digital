"use client";

import { useEffect } from "react";
import { registrarVista } from "@/app/aulas/actions";

// Avisa o servidor, uma vez por abertura, que o aluno está nesta aula.
export default function RegistrarVista({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    registrarVista(lessonId);
  }, [lessonId]);
  return null;
}
