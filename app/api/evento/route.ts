import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PATH_RE = /^\/[a-z0-9/_-]{0,60}$/;
const KINDS = new Set(["view", "lead", "checkout"]);
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor/i;

// Registra visitas e passos do funil (view, lead, checkout) das páginas públicas.
// Sem dados pessoais: só um identificador anônimo do navegador, o caminho e a origem.
export async function POST(request: NextRequest) {
  if (BOT_RE.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  let body: { v?: unknown; path?: unknown; kind?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const visitor = typeof body.v === "string" ? body.v.slice(0, 64) : "";
  const path = typeof body.path === "string" ? body.path : "";
  const kind = typeof body.kind === "string" ? body.kind : "";
  const source = typeof body.source === "string" ? body.source.trim().toLowerCase().slice(0, 80) : "";

  if (!visitor || !PATH_RE.test(path) || !KINDS.has(kind)) return new NextResponse(null, { status: 204 });

  try {
    await createAdminClient().from("page_events").insert({ visitor_id: visitor, path, kind, source: source || null });
  } catch (err) {
    console.error("evento error", err);
  }
  return new NextResponse(null, { status: 204 });
}
