import type { CSSProperties } from "react";

// Fotos do Aaron. Coloque os arquivos em /public/aaron com estes nomes (JPG, de preferência
// horizontais e com boa resolução). Enquanto o arquivo não existir, o site mostra só o degradê
// escuro, então nada quebra.
export const FOTOS = {
  hero: "/aaron/hero.jpg", // página de venda, topo (ideal: 2400 px de largura, Aaron à direita)
  captura: "/aaron/captura.jpg", // página de captura (se não existir, usa o degradê escuro)
  sobre: "/aaron/sobre.jpg", // seção "Quem é o Aaron" (retrato, 4:5)
  entrar: "/aaron/entrar.jpg", // tela de acesso
  aulas: "/aaron/aulas.jpg", // faixa de boas-vindas da área do aluno
} as const;

// Foto de fundo com um véu escuro por cima para o texto ficar legível.
export function fondoFoto(
  src: string,
  veu = "linear-gradient(90deg, rgba(10,10,10,.92) 0%, rgba(10,10,10,.6) 55%, rgba(10,10,10,.25) 100%)",
  posicion = "center",
): CSSProperties {
  return {
    backgroundImage: `${veu}, url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: posicion,
  };
}
