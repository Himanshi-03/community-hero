"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase puts the user into a temporary "recovery" session when they
  // click the emailed link - we just need to confirm that session exists
  // before letting them set a new password.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900">Set a new password</h1>

        {!ready ? (
          <p className="mt-4 text-sm text-neutral-500">
            Verifying your reset link...
          </p>
        ) : success ? (
          <p className="mt-4 rounded-lg bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
            ✓ Password updated! Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                New password
              </label>
              <PasswordInput value={password} onChange={setPassword} placeholder="At least 6 characters" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Confirm new password
              </label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />
            </div>

            {error && (
              <p className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
