import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LoggedOutLanding />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { count: totalCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true });

  const { count: resolvedCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .in("status", ["resolved", "closed"]);

  const { count: myCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="bg-neutral-50">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-14 sm:grid-cols-[1.2fr_1fr] sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-700">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">
              Hey {profile?.display_name ?? "there"} —<br />
              what needs fixing today?
            </h1>
            <p className="mt-5 max-w-md text-base text-neutral-600">
              Report a new issue in seconds, check the live map of what your
              neighbors have flagged, or see how the whole community is doing.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/report/new"
                className="rounded-lg bg-[#f4c430] px-6 py-3 text-sm font-bold text-[#1a1a1a] hover:bg-[#e0b020]"
              >
                🚨 Report an issue
              </Link>
              <Link
                href="/map"
                className="rounded-lg border-2 border-neutral-900 px-6 py-3 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
              >
                View the map
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border-2 border-transparent px-6 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Community stats →
              </Link>
            </div>
          </div>

          {/* Signature element: hazard sign card with live community stats */}
          <div className="relative rotate-1 border-4 border-neutral-900 bg-neutral-50 p-6 shadow-[6px_6px_0_var(--color-neutral-900)]">
            <div className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4c430] text-lg shadow-md">
              📍
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Community Snapshot
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Stat value={totalCount ?? 0} label="Total Reports" />
              <Stat value={resolvedCount ?? 0} label="Resolved" accent />
              <Stat value={myCount ?? 0} label="Reported by You" />
              <Stat
                value={totalCount ? `${Math.round(((resolvedCount ?? 0) / totalCount) * 100)}%` : "—"}
                label="Resolution Rate"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-3xl font-black ${accent ? "text-emerald-600" : "text-neutral-900"}`}>
        {value}
      </p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  );
}

function LoggedOutLanding() {
  return (
    <div className="bg-[#1a1a1a] text-white">
      {/* Hazard stripe accent bar */}
      <div
        className="h-2 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #f4c430 0, #f4c430 16px, #1a1a1a 16px, #1a1a1a 32px)",
        }}
      />

      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 sm:grid-cols-[1.3fr_1fr] sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f4c430]">
              Civic Reporting · Real Time
            </p>
            <h1
              className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl"
              style={{ fontFamily: "Arial Black, Arial, sans-serif" }}
            >
              See it.
              <br />
              Report it.
              <br />
              <span className="text-[#f4c430]">Fix it.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-neutral-300">
              Potholes, dead streetlights, overflowing bins, burst pipes — the
              problems on your street, mapped, verified by your neighbors, and
              tracked until they&apos;re actually resolved.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded bg-[#f4c430] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#1a1a1a] hover:bg-[#e0b020]"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded border border-neutral-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:border-white"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Signature element: hazard sign card */}
          <div className="relative rotate-1 border-4 border-[#f4c430] bg-[#222] p-5">
            <div className="absolute -top-3 -left-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4c430] text-lg">
              🚧
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Live Status Pipeline
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" /> Submitted
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" /> Under Review
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> Assigned
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" /> In Progress
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Resolved
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-neutral-800 bg-[#161616]">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px sm:grid-cols-3">
          <FeatureBlock
            emoji="📸"
            title="Snap & Submit"
            body="Take a photo, share your location, done. AI tags the issue automatically."
          />
          <FeatureBlock
            emoji="👍"
            title="Community Backed"
            body="Support existing reports instead of filing duplicates. More support, more priority."
          />
          <FeatureBlock
            emoji="📍"
            title="Tracked on a Map"
            body="Every issue lives on a public map with a transparent status, start to finish."
          />
        </div>
      </section>

      <div
        className="h-2 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #f4c430 0, #f4c430 16px, #1a1a1a 16px, #1a1a1a 32px)",
        }}
      />
    </div>
  );
}

function FeatureBlock({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="border-neutral-800 px-8 py-10 sm:border-l">
      <span className="text-2xl">{emoji}</span>
      <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
      <p className="mt-2 text-sm text-neutral-400">{body}</p>
    </div>
  );
}
