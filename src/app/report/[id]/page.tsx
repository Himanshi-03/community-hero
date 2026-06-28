import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConfirmButton from "@/components/ConfirmButton";
import RatingForm from "@/components/RatingForm";
import { STATUS_STYLES, CATEGORY_LABELS, statusLabel } from "@/lib/constants";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (reportError || !report) {
    console.error("Failed to load report:", reportError);
    notFound();
  }

  // Fetch the reporter's profile separately - more reliable than relying on
  // Supabase auto-detecting the relationship through auth.users
  const { data: reporterProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", report.user_id)
    .maybeSingle();

  const { data: { user } } = await supabase.auth.getUser();

  let alreadyConfirmed = false;
  if (user) {
    const { data: confirmation } = await supabase
      .from("confirmations")
      .select("id")
      .eq("report_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    alreadyConfirmed = !!confirmation;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.image_url}
          alt={report.note ?? "Reported issue"}
          className="aspect-video w-full object-cover"
        />

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            {report.is_emergency && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                🚨 EMERGENCY
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                STATUS_STYLES[report.status] ?? "bg-neutral-100 text-neutral-700"
              }`}
            >
              {statusLabel(report.status).toUpperCase()}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
              {CATEGORY_LABELS[report.category] ?? report.category}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 capitalize">
              Severity: {report.severity}
            </span>
          </div>

          {report.ai_description && (
            <p className="mt-4 text-sm text-neutral-600">{report.ai_description}</p>
          )}

          {report.note && (
            <p className="mt-2 text-sm text-neutral-800">
              <span className="font-medium">Reporter&apos;s note: </span>
              {report.note}
            </p>
          )}

          <p className="mt-4 text-xs text-neutral-400">
            Reported by {reporterProfile?.display_name ?? "a community member"} ·{" "}
            {new Date(report.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            📍 {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
          </p>

          <div className="mt-6 space-y-3">
            <ConfirmButton
              reportId={report.id}
              currentUserId={user?.id ?? null}
              alreadyConfirmed={alreadyConfirmed}
              confirmationCount={report.confirmation_count}
            />

            {(report.status === "resolved" || report.status === "closed") &&
              user?.id === report.user_id && (
                <RatingForm
                  reportId={report.id}
                  existingRating={report.rating}
                  existingFeedback={report.feedback_text}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
