import { createClient } from "@/lib/supabase/server";
import { STATUSES, STATUS_STYLES, STATUS_DOT_COLORS, CATEGORY_LABELS, statusLabel } from "@/lib/constants";

export default async function CitizenDashboardPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("status, category, created_at, resolved_at");

  const all = reports ?? [];
  const total = all.length;
  const resolved = all.filter((r) => r.status === "resolved" || r.status === "closed");
  const pending = total - resolved.length;

  const byStatus: Record<string, number> = {};
  for (const r of all) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

  const byCategory: Record<string, number> = {};
  for (const r of all) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;

  // Average resolution time, in days, for reports that have a resolved_at timestamp
  const resolutionTimes = all
    .filter((r) => r.resolved_at)
    .map((r) => (new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const avgResolutionDays =
    resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : null;

  // Last 7 days trend - count of reports submitted per day
  const last7Days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayKey = day.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const count = all.filter((r) => {
      const created = new Date(r.created_at);
      return created.toDateString() === day.toDateString();
    }).length;
    last7Days.push({ date: dayKey, count });
  }
  const maxDayCount = Math.max(1, ...last7Days.map((d) => d.count));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Community Transparency Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Public, real-time stats on how your community&apos;s reported issues are being handled.
      </p>

      {/* Top stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Complaints" value={total} />
        <Stat label="Resolved" value={resolved.length} color="text-emerald-600" />
        <Stat label="Pending" value={pending} color="text-amber-600" />
        <Stat
          label="Avg Resolution Time"
          value={avgResolutionDays !== null ? `${avgResolutionDays.toFixed(1)}d` : "—"}
        />
      </div>

      {/* Status breakdown */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-700">Status Breakdown</h2>
        <div className="mt-3 space-y-2">
          {STATUSES.map((s) => {
            const count = byStatus[s] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="w-28 text-xs text-neutral-600">{statusLabel(s)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: STATUS_DOT_COLORS[s] ?? "#9a9183" }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-neutral-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-700">Issues by Category</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Object.entries(byCategory).map(([cat, count]) => (
            <div key={cat} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center">
              <p className="text-lg font-bold text-neutral-900">{count}</p>
              <p className="text-xs text-neutral-500">{CATEGORY_LABELS[cat] ?? cat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day trend */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-700">Reports in the Last 7 Days</h2>
        <div className="mt-3 flex items-end gap-2" style={{ height: "120px" }}>
          {last7Days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-emerald-500"
                style={{ height: `${(d.count / maxDayCount) * 90}px`, minHeight: d.count > 0 ? "4px" : "0px" }}
              />
              <span className="text-[10px] text-neutral-400">{d.date}</span>
              <span className="text-[10px] font-medium text-neutral-600">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? "text-neutral-900"}`}>{value}</p>
    </div>
  );
}
