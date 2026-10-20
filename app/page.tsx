import { redirect } from "next/navigation";

// Normalmente a raiz é redirecionada antes de chegar aqui (veja proxy.ts, variável PAGINA_INICIAL).
// Isto é só uma rede de segurança.
export default function Raiz() {
  redirect("/captura");
}
