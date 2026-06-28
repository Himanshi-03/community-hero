"use client";

import { useState } from "react";

type Coordinates = { latitude: number; longitude: number };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // Common cause: user denied the permission popup
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please allow location access and try again."
            : "Couldn't get your location. Try again."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return { coords, error, loading, requestLocation };
}
