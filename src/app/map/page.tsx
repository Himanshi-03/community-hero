import { createClient } from "@/lib/supabase/server";
import MapViewWrapper from "@/components/MapViewWrapper";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, latitude, longitude, category, status, image_url, is_emergency")
    .order("created_at", { ascending: false });

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <h1 className="text-lg font-semibold text-neutral-900">
          Community Issue Map
        </h1>
        <p className="text-xs text-neutral-500">
          {reports?.length ?? 0} reported issue{reports?.length === 1 ? "" : "s"} ·
          🟡 Submitted &nbsp;🟠 Under Review &nbsp;🔵 Assigned &nbsp;🟣 In Progress &nbsp;🟢 Resolved &nbsp;⚫ Closed
        </p>
      </div>
      <div className="flex-1">
        <MapViewWrapper reports={reports ?? []} />
      </div>
    </div>
  );
}
