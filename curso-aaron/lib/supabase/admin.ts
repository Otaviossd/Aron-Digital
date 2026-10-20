import { createClient } from "@supabase/supabase-js";
import { envLimpio, supabaseUrl } from "@/lib/env";

// Cliente com service role: ignora RLS. Usar SOMENTE no servidor (webhooks, tarefas).
export function createAdminClient() {
  return createClient(supabaseUrl()!, envLimpio(process.env.SUPABASE_SERVICE_ROLE_KEY)!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
