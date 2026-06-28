"use client";

import dynamic from "next/dynamic";

// Leaflet touches the browser's `window` object directly, so it must never
// run on the server. ssr:false guarantees this component only loads in the browser.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
      Loading map...
    </div>
  ),
});

type Report = {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
  image_url: string;
  is_emergency?: boolean;
};

export default function MapViewWrapper({ reports }: { reports: Report[] }) {
  return <MapView reports={reports} />;
}
