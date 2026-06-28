// Centralized constants for the 6-stage status pipeline, categories, and
// emergency styling. Keeping these in one place means every page (detail,
// map, history, admin) stays visually consistent automatically.

export const STATUSES = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  reported: "Submitted", // legacy value from before this migration - treat as "submitted"
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_STYLES: Record<string, string> = {
  reported: "bg-yellow-500/15 text-yellow-300",
  submitted: "bg-yellow-500/15 text-yellow-300",
  under_review: "bg-orange-500/15 text-orange-300",
  assigned: "bg-blue-500/15 text-blue-300",
  in_progress: "bg-purple-500/15 text-purple-300",
  resolved: "bg-emerald-500/15 text-emerald-300",
  closed: "bg-neutral-300/15 text-neutral-400",
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  reported: "#eab308",
  submitted: "#eab308",
  under_review: "#f97316",
  assigned: "#3b82f6",
  in_progress: "#a855f7",
  resolved: "#10b981",
  closed: "#737373",
};

export const CATEGORY_LABELS: Record<string, string> = {
  pothole: "🕳️ Pothole",
  streetlight: "💡 Streetlight",
  garbage: "🗑️ Garbage / Waste",
  water_leak: "💧 Water Leak",
  other: "⚠️ Other Issue",
  uncategorized: "⏳ Categorizing...",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  pothole: "🕳️",
  streetlight: "💡",
  garbage: "🗑️",
  water_leak: "💧",
  other: "⚠️",
  uncategorized: "⏳",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}
