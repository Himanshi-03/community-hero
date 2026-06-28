"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function NewReportPage() {
  const router = useRouter();
  const supabase = createClient();
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!imageFile) {
      setError("Please add a photo of the issue.");
      return;
    }
    if (!coords) {
      setError("Please share your location first.");
      return;
    }

    setSubmitting(true);

    // 1. Check the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to submit a report.");
      setSubmitting(false);
      return;
    }

    // 2. Upload the image to Supabase Storage
    const fileExt = imageFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("report-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      setSubmitting(false);
      return;
    }

    // 3. Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from("report-images")
      .getPublicUrl(filePath);

    // 4. Insert the report row (category/severity stay default until AI step runs)
    const { data: report, error: insertError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        note: note || null,
        latitude: coords.latitude,
        longitude: coords.longitude,
        status: "submitted",
        is_emergency: isEmergency,
      })
      .select()
      .single();

    if (insertError) {
      setError(`Could not save report: ${insertError.message}`);
      setSubmitting(false);
      return;
    }

    // 5. Fire off AI categorization in the background (built on Day 3)
    //    We don't await this with a blocking UI - report is already saved.
    fetch("/api/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: report.id, imageUrl: urlData.publicUrl }),
    }).catch(() => {
      // Non-fatal: report still exists, just stays "uncategorized" if this fails
    });

    setSubmitting(false);
    router.push(`/report/${report.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Report an issue</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Snap a photo, share your location, and we&apos;ll take care of the rest.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">Photo</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-emerald-400"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-sm text-neutral-400">
                <p className="text-2xl">📷</p>
                <p>Tap to take or upload a photo</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">Location</label>
          {coords ? (
            <p className="mt-1 rounded-lg bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
              📍 Location captured ({coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)})
            </p>
          ) : (
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              {geoLoading ? "Getting location..." : "📍 Share my current location"}
            </button>
          )}
          {geoError && <p className="mt-1 text-sm text-red-600">{geoError}</p>}
        </div>

        {/* Optional note */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Note <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Anything else worth mentioning?"
          />
        </div>

        {/* Emergency toggle */}
        <button
          type="button"
          onClick={() => setIsEmergency((v) => !v)}
          className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition ${
            isEmergency
              ? "border-red-500 bg-red-950/30"
              : "border-neutral-200 bg-neutral-50 hover:border-red-800"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <span>
              <span className={`block text-sm font-semibold ${isEmergency ? "text-red-400" : "text-neutral-700"}`}>
                Mark as Emergency
              </span>
              <span className="block text-xs text-neutral-500">
                Fire hazard, fallen wire, major leak, or dangerous road
              </span>
            </span>
          </span>
          <span
            className={`h-6 w-11 rounded-full p-1 transition ${isEmergency ? "bg-red-500" : "bg-neutral-300"}`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-neutral-50 transition ${isEmergency ? "translate-x-5" : ""}`}
            />
          </span>
        </button>

        {error && (
          <p className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit report"}
        </button>
      </form>
    </div>
  );
}
