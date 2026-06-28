"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STATUSES, STATUS_STYLES, CATEGORY_LABELS, statusLabel } from "@/lib/constants";

type Report = {
  id: string;
  image_url: string;
  note: string | null;
  category: string;
  status: string;
  is_emergency: boolean;
  confirmation_count: number;
  created_at: string;
};

export default function MyReportsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("reports")
      .select("id, image_url, note, category, status, is_emergency, confirmation_count, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setReports(data ?? []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function startEdit(report: Report) {
    setEditingId(report.id);
    setEditNote(report.note ?? "");
  }

  async function saveEdit(id: string) {
    await supabase.from("reports").update({ note: editNote || null }).eq("id", id);
    setEditingId(null);
    loadReports();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from("reports").delete().eq("id", id);
    setDeletingId(null);
    loadReports();
  }

  const filtered = reports.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch =
      search.trim() === "" ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      (r.note ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">My Reports</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Track, edit, or remove the issues you&apos;ve reported.
      </p>

      {!loading && reports.length > 0 && (
        <div className="mt-3">
          <ReputationBadge count={reports.length} />
        </div>
      )}

      {/* Search + filter */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by category, note, or ID..."
          className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p className="mt-8 text-sm text-neutral-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          {reports.length === 0
            ? "You haven't reported any issues yet."
            : "No reports match your filters."}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.image_url}
                alt={report.category}
                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {report.is_emergency && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      🚨 EMERGENCY
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_STYLES[report.status] ?? "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {statusLabel(report.status).toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(report.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <p className="mt-1 text-sm font-medium text-neutral-900">
                  {CATEGORY_LABELS[report.category] ?? report.category}
                </p>

                {editingId === report.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1 text-sm text-neutral-900"
                    />
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => saveEdit(report.id)}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  report.note && <p className="mt-1 truncate text-xs text-neutral-500">{report.note}</p>
                )}

                <div className="mt-2 flex items-center gap-3 text-xs">
                  <Link href={`/report/${report.id}`} className="font-medium text-emerald-600 hover:underline">
                    View details
                  </Link>
                  {report.status === "submitted" && editingId !== report.id && (
                    <>
                      <button
                        onClick={() => startEdit(report)}
                        className="text-neutral-500 hover:text-neutral-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={deletingId === report.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === report.id ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReputationBadge({ count }: { count: number }) {
  let badge: { label: string; emoji: string; color: string } | null = null;

  if (count >= 10) {
    badge = { label: "Top Reporter", emoji: "🏆", color: "bg-amber-500/15 text-amber-300" };
  } else if (count >= 5) {
    badge = { label: "Community Helper", emoji: "🤝", color: "bg-blue-500/15 text-blue-300" };
  } else if (count >= 1) {
    badge = { label: "Active Citizen", emoji: "🌱", color: "bg-emerald-500/15 text-emerald-300" };
  }

  if (!badge) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>
      {badge.emoji} {badge.label}
    </span>
  );
}
