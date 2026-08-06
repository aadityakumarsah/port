import { createClient } from "@supabase/supabase-js";

// Server-side client using the service (secret) key.
// Never import this from frontend code.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
);
