const FALLBACK_LAT = Number(import.meta.env.VITE_FALLBACK_LAT ?? "12.9716");
const FALLBACK_LNG = Number(import.meta.env.VITE_FALLBACK_LNG ?? "77.5946");

export interface Coords {
  lat: number;
  lng: number;
  source: "browser" | "fallback";
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
        }),
      () =>
        resolve({ lat: FALLBACK_LAT, lng: FALLBACK_LNG, source: "fallback" }),
      { timeout: 8000 },
    );
  });
}
