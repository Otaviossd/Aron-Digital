import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rutaInicial } from "@/lib/destino";
import { BRAND } from "@/lib/config";
import { FOTOS, fondoFoto } from "@/lib/fotos";
import FormAcceso from "@/components/FormAcceso";

type Props = { modo: "alumno" | "equipo"; searchParams: Promise<{ error?: string; erro?: string }> };

// Se a pessoa já está logada, vai direto para o lugar dela (equipe → painel, aluno → aulas).
// Só quem não tem sessão vê o formulário de acesso.
export default async function PuertaAcceso({ modo, searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(await rutaInicial(supabase));

  const titulo = modo === "equipo" ? "Panel del equipo" : "Entrá a tu curso";
  const sub =
    modo === "equipo"
      ? "Alumnos, contenido y emails en un solo lugar."
      : "Tus clases, tu progreso y todo el material en un solo lugar.";

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block" style={fondoFoto(FOTOS.entrar, "linear-gradient(180deg, rgba(10,10,10,.35) 0%, rgba(10,10,10,.85) 100%)")}>
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(57,255,126,.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-sm text-2xl font-medium leading-snug tracking-tight text-ink/90">
            Barbería de verdad, paso a paso, con clases nuevas cada semana.
          </p>
          <p className="mt-3 text-sm text-muted">Aaron Dalla Rosa</p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Link href="/" className="text-sm font-medium tracking-tight text-ink/90">
          {BRAND}
        </Link>
        <div className="flex flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
          <p className="mb-9 mt-2 max-w-sm text-sm leading-relaxed text-muted">{sub}</p>
          <FormAcceso modo={modo} error={Boolean(sp.error || sp.erro)} />
        </div>
      </div>
    </main>
  );
}
