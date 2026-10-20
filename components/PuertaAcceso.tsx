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
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      {/* Luces de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="rejilla absolute inset-0" />
        <div className="respirar absolute -right-32 top-10 h-[32rem] w-[32rem] rounded-full bg-accent/25 blur-[130px]" />
        <div className="respirar absolute -bottom-40 right-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-400/15 blur-[120px] [animation-delay:-3s]" />
      </div>

      {/* Lado de la foto */}
      <div className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0"
          style={fondoFoto(FOTOS.entrar, "linear-gradient(180deg, rgba(7,9,10,.15) 0%, rgba(7,9,10,.9) 100%)", "center 20%")}
        />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_10%,rgba(57,255,126,.28),transparent)] mix-blend-screen" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-bg to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <div className="cristal max-w-md rounded-2xl p-6">
            <p className="text-2xl font-medium leading-snug tracking-tight">
              Barbería de verdad, paso a paso, con <span className="texto-luz">clases nuevas cada semana.</span>
            </p>
            <p className="mt-3 text-sm text-muted">Aaron Dalla Rosa</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="relative flex flex-col px-6 py-10 sm:px-12">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink/90">
          {BRAND}
        </Link>
        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="cristal relative w-full max-w-md overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
            <p className="mb-8 mt-2 max-w-sm text-sm leading-relaxed text-muted">{sub}</p>
            <FormAcceso modo={modo} error={Boolean(sp.error || sp.erro)} />
          </div>
        </div>
      </div>
    </main>
  );
}
