"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmButton({
  reportId,
  currentUserId,
  alreadyConfirmed,
  confirmationCount,
}: {
  reportId: string;
  currentUserId: string | null;
  alreadyConfirmed: boolean;
  confirmationCount: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyConfirmed);

  async function handleConfirm() {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("confirmations")
      .insert({ report_id: reportId, user_id: currentUserId });

    setLoading(false);

    if (error) {
      // Unique constraint violation = they already confirmed (race condition safety net)
      if (error.code === "23505") {
        setDone(true);
      } else {
        setError("Couldn't confirm right now. Try again.");
      }
      return;
    }

    setDone(true);
    router.refresh(); // re-fetches the report to show the updated count/status
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-950/40 px-4 py-2.5 text-sm font-medium text-emerald-300">
        ✓ You supported this issue ({confirmationCount} supporter{confirmationCount === 1 ? "" : "s"})
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full rounded-lg border-2 border-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-950/30 disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : `👍 Support this complaint (${confirmationCount})`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
