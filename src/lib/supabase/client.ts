// This client is used in CLIENT COMPONENTS (code that runs in the user's browser).
// Use this when you're inside a component marked "use client" at the top of the file.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
