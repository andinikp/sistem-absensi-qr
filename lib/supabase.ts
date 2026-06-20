import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Nilai cadangan hanya menjaga aplikasi dapat dibangun sebelum .env.local diisi.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = createClient(
  supabaseUrl || "https://contoh.supabase.co",
  supabaseAnonKey || "kunci-anon-belum-diatur"
);
