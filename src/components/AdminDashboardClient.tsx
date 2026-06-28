"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STATUSES, STATUS_STYLES, CATEGORY_LABELS, statusLabel } from "@/lib/constants";

type Report = {
  id: string;
  image_url: string;
  category: string;
  status: string;
  severity: string;
  is_emergency: boolean;
  confirmation_count: number;
  created_at: string;
  user_id: string;
};

type Stats = {
  total: number;
  byStatus: Record<string, number>;
  emergencyCount: number;
  avgRating: number | null;
};

export default function AdminDashboardClient({
  initialReports,
  stats,
}: {
  initialReports: Report[];
  stats: Stats;
}) {
  const supabase = createClient();
  const [reports, setReports] = useState(initialReports);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    const { error } = await supabase.from("reports").update({ status: newStatus }).eq("id", id);
    setUpdatingId(null);

    if (!error) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    }
  }

  const filtered =
    statusFilter === "all" ? reports : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage and triage all community reports.</p>

      {/* Analytics cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Reports" value={stats.total} />
        <StatCard label="Emergencies" value={stats.emergencyCount} highlight={stats.emergencyCount > 0} />
        <StatCard label="Resolved" value={stats.byStatus.resolved ?? 0} />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating ? `${stats.avgRating.toFixed(1)} ⭐` : "—"}
        />
      </div>

      {/* Status breakdown */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[s]}`}
          >
            {statusLabel(s)}: {stats.byStatus[s] ?? 0}
          </span>
        ))}
      </div>

      {/* Filter */}
      <div className="mt-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
        >
          <option value="all">All statuses ({reports.length})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)} ({stats.byStatus[s] ?? 0})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2">Issue</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Support</th>
              <th className="px-4 py-2">Reported</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.id} className="border-t border-neutral-100">
                <td className="px-4 py-2">
                  <Link href={`/report/${report.id}`} className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.image_url}
                      alt={report.category}
                      className="h-10 w-10 rounded object-cover"
                    />
                    {report.is_emergency && <span title="Emergency">🚨</span>}
                  </Link>
                </td>
                <td className="px-4 py-2 capitalize">
                  {CATEGORY_LABELS[report.category] ?? report.category}
                </td>
                <td className="px-4 py-2">👍 {report.confirmation_count}</td>
                <td className="px-4 py-2 text-xs text-neutral-500">
                  {new Date(report.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={report.status}
                    disabled={updatingId === report.id}
                    onChange={(e) => updateStatus(report.id, e.target.value)}
                    className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold ${
                      STATUS_STYLES[report.status] ?? "bg-neutral-100"
                    }`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">No reports match this filter.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-red-800 bg-red-950/30" : "border-neutral-200 bg-neutral-50"
      }`}
    >
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-red-400" : "text-neutral-900"}`}>
        {value}
      </p>
    </div>
  );
}
