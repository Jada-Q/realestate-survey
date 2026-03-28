import { createClient } from "@supabase/supabase-js";

export function getServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type Response = {
  id: string;
  created_at: string;
  identity: string[];
  buyer_source: string | null;
  agent_time: string | null;
  barrier: string | null;
};
