export type UserLocation = { lat: number; lon: number; source: "geo" | "fallback" };

export function getCurrentPositionSafe(
  opts: PositionOptions = { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("GEO_UNSUPPORTED"));

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => {
        const codeMap: Record<number, string> = {
          1: "GEO_PERMISSION_DENIED",
          2: "GEO_POSITION_UNAVAILABLE",
          3: "GEO_TIMEOUT",
        };
        reject(new Error(codeMap[err.code] || "GEO_UNKNOWN"));
      },
      opts
    );
  });
}

export async function resolveUserLocation(): Promise<UserLocation> {
  const requireGeo = import.meta.env.VITE_REQUIRE_GEO !== "false";
  if (!requireGeo) {
    return { lat: 37.5662952, lon: 126.9779451, source: "fallback" };
  }

  try {
    const pos = await getCurrentPositionSafe();
    return { lat: pos.coords.latitude, lon: pos.coords.longitude, source: "geo" };
  } catch {
    return { lat: 37.5662952, lon: 126.9779451, source: "fallback" };
  }
}
