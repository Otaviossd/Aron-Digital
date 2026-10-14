import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { apagarAula, apagarModulo, guardarAula, guardarModulo } from "./actions";

type Modulo = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  unlock_after_days: number;
  cover_url: string | null;
  accent: string;
};
type Aula = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  position: number;
  video_url: string | null;
  duration_minutes: number | null;
  published_at: string;
};
type Sub = {
  email: string;
  plan: string;
  status: string;
  purchased_at: string;
  access_until: string | null;
  refunded_at: string | null;
};

const campo = "w-full border border-white/20 bg-black px-3 py-2 text-sm outline-none focus:border-acid";
const rotulo = "mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/50";
const botao = "border-2 border-acid bg-acid px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-transparent hover:text-acid";
const botaoPerigo = "border border-red-500/60 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10";

// datetime-local em horário de Assunção (UTC-03:00)
const paraInput = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16);

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Painel />
    </Suspense>
  );
}

async function Painel() {
  const supabase = await createClient();
  const [{ data: m }, { data: a }, { data: s }, { data: es }] = await Promise.all([
    supabase.from("modules").select("*").order("position"),
    supabase.from("lessons").select("*").order("position"),
    supabase.from("subscriptions").select("email, plan, status, purchased_at, access_until, refunded_at").order("purchased_at", { ascending: false }),
    supabase.rpc("email_stats"),
  ]);
  const stats = (es ?? null) as {
    leads: number;
    pendientes: number;
    bajas: number;
    enviados: Record<string, number>;
    recuperados: number;
  } | null;
  const modulos = (m ?? []) as Modulo[];
  const aulas = (a ?? []) as Aula[];
  const subs = (s ?? []) as Sub[];
  const ativas = subs.filter((x) => x.status === "active" && !x.refunded_at).length;

  return (
    <div className="space-y-12">
      {/* Resumo */}
      <section className="grid grid-cols-3 gap-px bg-white/10 text-center">
        {[
          ["Alunos ativos", ativas],
          ["Compras totais", subs.length],
          ["Módulos / aulas", `${modulos.length} / ${aulas.length}`],
        ].map(([t, v]) => (
          <div key={t as string} className="bg-black p-5">
            <p className="text-3xl font-black text-acid">{v}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{t}</p>
          </div>
        ))}
      </section>

      {/* E-mails de carrinho abandonado */}
      {stats && (
        <section>
          <h2 className="mb-4 text-xl font-black uppercase tracking-tight">E-mails de carrinho abandonado</h2>
          <div className="grid grid-cols-2 gap-px bg-white/10 text-center sm:grid-cols-4">
            {[
              ["Leads (e-mails no checkout)", stats.leads],
              ["Pendentes", stats.pendientes],
              ["Recuperados", stats.recuperados],
              ["Descadastros", stats.bajas],
            ].map(([t, v]) => (
              <div key={t as string} className="bg-black p-5">
                <p className="text-3xl font-black text-acid">{v}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{t}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/50">
            Enviados: e-mail 1 (1 h) = {stats.enviados["1"] ?? 0} · e-mail 2 (24 h) = {stats.enviados["2"] ?? 0} · e-mail 3 (48 h) ={" "}
            {stats.enviados["3"] ?? 0}. “Recuperado” = comprou depois de receber ao menos um e-mail; pode incluir quem
            compraria de qualquer forma.
          </p>
        </section>
      )}

      {/* Módulos */}
      <section>
        <h2 className="mb-4 text-xl font-black uppercase tracking-tight">Módulos e aulas</h2>

        <div className="space-y-4">
          {modulos.map((mod) => {
            const lista = aulas.filter((x) => x.module_id === mod.id);
            return (
              <details key={mod.id} className="border border-white/10 bg-[#141414]">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
                  <span className="font-bold">
                    <span className="mr-3 text-white/40">#{mod.position}</span>
                    {mod.title}
                  </span>
                  <span className="text-xs text-white/40">
                    {lista.length} aulas · abre no dia {mod.unlock_after_days}
                  </span>
                </summary>

                <div className="space-y-6 border-t border-white/10 p-5">
                  {/* Editar módulo */}
                  <form action={guardarModulo} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={mod.id} />
                    <div className="sm:col-span-2">
                      <label className={rotulo}>Título</label>
                      <input name="title" defaultValue={mod.title} required className={campo} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={rotulo}>Descrição</label>
                      <input name="description" defaultValue={mod.description ?? ""} className={campo} />
                    </div>
                    <div>
                      <label className={rotulo}>Ordem</label>
                      <input name="position" type="number" defaultValue={mod.position} className={campo} />
                    </div>
                    <div>
                      <label className={rotulo}>Libera no dia (após a compra)</label>
                      <input name="unlock_after_days" type="number" min={0} defaultValue={mod.unlock_after_days} className={campo} />
                    </div>
                    <div>
                      <label className={rotulo}>Cor de destaque</label>
                      <input name="accent" defaultValue={mod.accent} placeholder="#d4ff00" className={campo} />
                    </div>
                    <div>
                      <label className={rotulo}>Capa (URL)</label>
                      <input name="cover_url" defaultValue={mod.cover_url ?? ""} className={campo} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={rotulo}>Ou enviar nova capa (vertical, 3:4)</label>
                      <input name="cover_file" type="file" accept="image/*" className="text-xs text-white/60" />
                    </div>
                    <div className="flex gap-3 sm:col-span-2">
                      <button className={botao}>Salvar módulo</button>
                    </div>
                  </form>
                  <form action={apagarModulo}>
                    <input type="hidden" name="id" value={mod.id} />
                    <button className={botaoPerigo}>Apagar módulo e suas aulas</button>
                  </form>

                  {/* Aulas */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-acid">Aulas</h3>
                    {lista.map((aula) => (
                      <details key={aula.id} className="border border-white/10 bg-black">
                        <summary className="flex cursor-pointer justify-between px-4 py-3 text-sm">
                          <span>
                            <span className="mr-2 text-white/40">#{aula.position}</span>
                            {aula.title}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(aula.published_at) > new Date() ? "agendada" : "publicada"}
                          </span>
                        </summary>
                        <FormAula moduloId={mod.id} aula={aula} />
                      </details>
                    ))}

                    <details className="border border-dashed border-acid/50">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-acid">+ Nova aula</summary>
                      <FormAula moduloId={mod.id} />
                    </details>
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        {/* Novo módulo */}
        <details className="mt-4 border border-dashed border-acid/50">
          <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-acid">+ Novo módulo</summary>
          <form action={guardarModulo} encType="multipart/form-data" className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={rotulo}>Título</label>
              <input name="title" required className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label className={rotulo}>Descrição</label>
              <input name="description" className={campo} />
            </div>
            <div>
              <label className={rotulo}>Ordem</label>
              <input name="position" type="number" defaultValue={modulos.length + 1} className={campo} />
            </div>
            <div>
              <label className={rotulo}>Libera no dia (após a compra)</label>
              <input name="unlock_after_days" type="number" min={0} defaultValue={0} className={campo} />
            </div>
            <div>
              <label className={rotulo}>Cor de destaque</label>
              <input name="accent" defaultValue="#d4ff00" className={campo} />
            </div>
            <div>
              <label className={rotulo}>Capa (URL)</label>
              <input name="cover_url" className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label className={rotulo}>Ou enviar capa (vertical, 3:4)</label>
              <input name="cover_file" type="file" accept="image/*" className="text-xs text-white/60" />
            </div>
            <div className="sm:col-span-2">
              <button className={botao}>Criar módulo</button>
            </div>
          </form>
        </details>
      </section>

      {/* Alunos */}
      <section>
        <h2 className="mb-4 text-xl font-black uppercase tracking-tight">Alunos</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-white/50">Ainda não há compras.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 bg-[#141414]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Compra</th>
                  <th className="px-4 py-3">Acesso até</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subs.map((x) => (
                  <tr key={x.email + x.purchased_at}>
                    <td className="px-4 py-3">{x.email}</td>
                    <td className="px-4 py-3">{x.plan === "annual" ? "Anual" : "Mensal"}</td>
                    <td className="px-4 py-3">{x.refunded_at ? "reembolsada" : x.status}</td>
                    <td className="px-4 py-3">{new Date(x.purchased_at).toLocaleDateString("es-PY")}</td>
                    <td className="px-4 py-3">{x.access_until ? new Date(x.access_until).toLocaleDateString("es-PY") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FormAula({ moduloId, aula }: { moduloId: string; aula?: Aula }) {
  return (
    <div className="space-y-3 border-t border-white/10 p-4">
      <form action={guardarAula} className="grid gap-3 sm:grid-cols-2">
        {aula && <input type="hidden" name="id" value={aula.id} />}
        <input type="hidden" name="module_id" value={moduloId} />
        <div className="sm:col-span-2">
          <label className={rotulo}>Título</label>
          <input name="title" defaultValue={aula?.title} required className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={rotulo}>Descrição</label>
          <textarea name="description" defaultValue={aula?.description ?? ""} rows={2} className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={rotulo}>Vídeo (arquivo .mp4 ou link de incorporação/embed)</label>
          <input name="video_url" defaultValue={aula?.video_url ?? ""} className={campo} />
        </div>
        <div>
          <label className={rotulo}>Ordem</label>
          <input name="position" type="number" defaultValue={aula?.position ?? 0} className={campo} />
        </div>
        <div>
          <label className={rotulo}>Duração (min)</label>
          <input name="duration_minutes" type="number" defaultValue={aula?.duration_minutes ?? ""} className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={rotulo}>Publicar em (deixe vazio para publicar agora; use para o vídeo de toda segunda)</label>
          <input name="published_at" type="datetime-local" defaultValue={aula ? paraInput(aula.published_at) : ""} className={campo} />
        </div>
        <div className="sm:col-span-2">
          <button className={botao}>{aula ? "Salvar aula" : "Criar aula"}</button>
        </div>
      </form>
      {aula && (
        <form action={apagarAula}>
          <input type="hidden" name="id" value={aula.id} />
          <button className={botaoPerigo}>Apagar aula</button>
        </form>
      )}
    </div>
  );
}
