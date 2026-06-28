import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, is_admin")
      .eq("id", user.id)
      .single();
    displayName = profile?.display_name ?? null;
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <nav className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-neutral-900">
          <span className="text-xl">📍</span>
          Community Hero
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-500 hover:text-neutral-900">
            Home
          </Link>
          <Link href="/map" className="text-neutral-500 hover:text-neutral-900">
            Map
          </Link>
          <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-900">
            Dashboard
          </Link>

          {user ? (
            <>
              <Link href="/my-reports" className="text-neutral-500 hover:text-neutral-900">
                My Reports
              </Link>
              {isAdmin && (
                <Link href="/admin" className="font-medium text-amber-500 hover:text-amber-400">
                  Admin
                </Link>
              )}
              <Link
                href="/report/new"
                className="rounded-lg bg-[#f4c430] px-3 py-1.5 font-bold text-[#1a1a1a] hover:bg-[#e0b020]"
              >
                Report an issue
              </Link>
              <span className="text-neutral-500">Hi, {displayName ?? "there"}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-500 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#f4c430] px-3 py-1.5 font-bold text-[#1a1a1a] hover:bg-[#e0b020]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
