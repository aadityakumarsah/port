import { createClient } from "@supabase/supabase-js";

// Bun inlines process.env.* at build time (see bunfig.toml: env = "BUN_PUBLIC_*")
const url = process.env.BUN_PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = process.env.BUN_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
