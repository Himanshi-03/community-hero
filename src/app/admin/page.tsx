import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("is_emergency", { ascending: false })
    .order("created_at", { ascending: false });

  // Basic analytics counts
  const total = reports?.length ?? 0;
  const byStatus: Record<string, number> = {};
  for (const r of reports ?? []) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  }
  const emergencyCount = reports?.filter((r) => r.is_emergency).length ?? 0;
  const avgRating = (() => {
    const rated = (reports ?? []).filter((r) => r.rating);
    if (rated.length === 0) return null;
    return rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  })();

  return (
    <AdminDashboardClient
      initialReports={reports ?? []}
      stats={{ total, byStatus, emergencyCount, avgRating }}
    />
  );
}
