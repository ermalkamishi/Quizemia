import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avtymbqkzmescreldqdk.supabase.co";
// Clean URL so it does not contain /rest/v1 or trailing slash
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dHltYnFrem1lc2NyZWxkcWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzI1NzUsImV4cCI6MjEwNjI0ODU3NX0.uWc4LqXBqW0dyutV-ac5lWyBRLl3gBH7KSRbDMdoQXg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
