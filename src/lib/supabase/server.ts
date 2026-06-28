// This client is used on the SERVER (API routes, Server Components, Server Actions).
// It reads the user's login session from cookies so we know who's making the request.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from a Server Component, where cookies
            // can't be set. This is safe to ignore if you have middleware
            // refreshing sessions (which we'll add next).
          }
        },
      },
    }
  );
}
