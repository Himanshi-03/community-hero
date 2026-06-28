"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RatingForm({
  reportId,
  existingRating,
  existingFeedback,
}: {
  reportId: string;
  existingRating: number | null;
  existingFeedback: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [rating, setRating] = useState(existingRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(existingFeedback ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRating);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("reports")
      .update({ rating, feedback_text: feedback || null })
      .eq("id", reportId);

    setSubmitting(false);

    if (!error) {
      setSubmitted(true);
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-4">
      <p className="text-sm font-semibold text-emerald-300">
        {submitted ? "Thanks for your feedback!" : "This issue was resolved - how did we do?"}
      </p>

      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitted}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl leading-none disabled:cursor-default"
          >
            {(hoverRating || rating) >= star ? "⭐" : "☆"}
          </button>
        ))}
      </div>

      {!submitted && (
        <>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            placeholder="Any comments? (optional)"
            className="mt-2 w-full rounded-lg border border-emerald-800 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="mt-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit feedback"}
          </button>
        </>
      )}

      {submitted && feedback && (
        <p className="mt-2 text-sm text-emerald-300">&ldquo;{feedback}&rdquo;</p>
      )}
    </div>
  );
}
