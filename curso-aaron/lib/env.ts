// Leitura tolerante das variáveis do Supabase. Valores colados com espaço, aspas ou vírgula no final
// (erro comum ao copiar e colar) são limpos em vez de derrubar o site.
//
// Importante: as variáveis NEXT_PUBLIC_* precisam aparecer escritas por extenso (process.env.NOME)
// para o Next.js conseguir embuti-las no navegador.

export function envLimpio(valor: string | undefined): string | undefined {
  if (!valor) return undefined;
  // Começo: espaços e aspas. Fim: espaços, aspas, vírgulas e ponto e vírgula (em qualquer ordem).
  const limpio = valor.replace(/^[\s"']+|[\s"',;]+$/g, "");
  return limpio || undefined;
}

export const supabaseUrl = () => envLimpio(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = () => envLimpio(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
