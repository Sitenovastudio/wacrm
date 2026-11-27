import { createClient } from "@supabase/supabase-js";

export function createSupabaseClients(config) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return { publicClient: null, adminClient: null };
  }

  const publicClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "X-Client-Info": "sitenova-connect-server" } },
  });

  // This client is server-only. Never serialize it or its key into a browser response.
  const adminClient = config.supabaseServiceRoleKey
    ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { "X-Client-Info": "sitenova-connect-server-admin" } },
      })
    : null;

  return { publicClient, adminClient };
}
