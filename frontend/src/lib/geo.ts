// West Lafayette, IN (Purdue campus area).
const FALLBACK_LAT = Number(import.meta.env.VITE_FALLBACK_LAT ?? "40.4259");
const FALLBACK_LNG = Number(import.meta.env.VITE_FALLBACK_LNG ?? "-86.9081");

export interface Coords {
  lat: number;
  lng: number;
  source: "browser" | "fallback";
  accuracy_m?: number;
}

export function getLocation(): Promise<Coords> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ lat: FALLBACK_LAT, lng: FALLBACK_LNG, source: "fallback" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "browser",
          accuracy_m: pos.coords.accuracy,
        }),
      () =>
        resolve({ lat: FALLBACK_LAT, lng: FALLBACK_LNG, source: "fallback" }),
      // High accuracy + no cached fix: a stale/low-res cached position is the
      // usual cause of a location landing in the wrong part of town.
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 },
    );
  });
}
