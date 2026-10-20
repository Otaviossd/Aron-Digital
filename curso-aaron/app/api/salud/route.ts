import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { envLimpio, supabaseAnonKey, supabaseUrl } from "@/lib/env";

// Diagnóstico de configuração. Mostra só "ok" / "FALTA" / "formato raro", nunca os valores.
// Depois de tudo funcionando, pode apagar esta pasta (app/api/salud).

const tieneFormatoJwt = (v: string) => v.split(".").length === 3;

export async function GET() {
  await connection(); // sempre avalia em tempo de execução, nunca em tempo de build

  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  const service = envLimpio(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const siteUrl = envLimpio(process.env.NEXT_PUBLIC_SITE_URL);

  const resultado: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: !url ? "FALTA" : /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) ? "ok" : "formato raro",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !anon
      ? "FALTA"
      : tieneFormatoJwt(anon) || anon.startsWith("sb_publishable_")
        ? "ok"
        : "formato raro",
    SUPABASE_SERVICE_ROLE_KEY: !service
      ? "FALTA"
      : tieneFormatoJwt(service) || service.startsWith("sb_secret_")
        ? "ok"
        : "formato raro",
    NEXT_PUBLIC_SITE_URL: !siteUrl ? "FALTA" : /^https?:\/\/[^/]+$/.test(siteUrl) ? "ok" : "formato raro (sin barra final)",
    // Estas só importam para pagamentos e e-mails
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ? "ok" : "FALTA",
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ? "ok" : "FALTA",
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ? "ok" : "FALTA",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "ok" : "FALTA",
    EMAIL_FROM: process.env.EMAIL_FROM ? "ok" : "FALTA",
    CRON_SECRET: process.env.CRON_SECRET ? "ok" : "FALTA",
  };

  // Teste real contra o banco: confirma URL, service_role e que o schema.sql foi executado
  if (url && service) {
    try {
      const { error } = await createAdminClient().from("modules").select("id", { count: "exact", head: true });
      resultado.banco = error
        ? `ERROR ${error.code ?? ""} ${error.message}`.trim()
        : "ok (conecta, service_role válida y tablas creadas)";
    } catch (err) {
      resultado.banco = `ERROR ${err instanceof Error ? err.message : "desconocido"}`;
    }
  } else {
    resultado.banco = "no probado (faltan URL o service_role)";
  }

  return Response.json(resultado, { headers: { "Cache-Control": "no-store" } });
}
