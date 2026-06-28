"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { STATUS_DOT_COLORS, CATEGORY_EMOJI, statusLabel } from "@/lib/constants";

type Report = {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
  image_url: string;
  is_emergency?: boolean;
};

// Build a custom colored pin icon per report status.
// Emergency reports get a thick red ring so they stand out immediately -
// this is the visual payoff of the "Emergency Complaints" feature.
function buildIcon(status: string, category: string, isEmergency: boolean) {
  const color = STATUS_DOT_COLORS[status] ?? "#737373";
  const emoji = isEmergency ? "🚨" : CATEGORY_EMOJI[category] ?? "⚠️";
  const ring = isEmergency ? "border:3px solid #dc2626;" : "border:2px solid white;";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        width:32px;height:32px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;${ring}
        box-shadow:0 1px 4px rgba(0,0,0,0.4);
      ">${emoji}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function MapView({ reports }: { reports: Report[] }) {
  // Default center: average of all report locations, or a fallback if empty
  const center: [number, number] =
    reports.length > 0
      ? [
          reports.reduce((sum, r) => sum + r.latitude, 0) / reports.length,
          reports.reduce((sum, r) => sum + r.longitude, 0) / reports.length,
        ]
      : [20.5937, 78.9629]; // fallback: center of India

  return (
    <MapContainer
      center={center}
      zoom={reports.length > 0 ? 13 : 5}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={buildIcon(report.status, report.category, !!report.is_emergency)}
        >
          <Popup>
            <div className="w-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.image_url}
                alt={report.category}
                className="mb-2 h-20 w-full rounded object-cover"
              />
              {report.is_emergency && (
                <p className="mb-1 text-xs font-bold text-red-600">🚨 EMERGENCY</p>
              )}
              <p className="text-xs font-semibold capitalize">
                {report.category.replace("_", " ")}
              </p>
              <p className="text-xs capitalize text-neutral-500">{statusLabel(report.status)}</p>
              <Link
                href={`/report/${report.id}`}
                className="mt-1 inline-block text-xs font-medium text-emerald-600 hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
