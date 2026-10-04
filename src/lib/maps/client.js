import { env } from "@/lib/env";

export const mapsConfigured = Boolean(env.GOOGLE_MAPS_API_KEY);

// The Maps API key is only ever used server-side to proxy geocoding/distance
// requests, or injected into the client bundle via a scoped, HTTP-referrer
// restricted key if you choose to render an interactive map client-side.
// Never ship the unrestricted server key to the browser.
export async function geocodeAddress(addressString) {
  if (!mapsConfigured) {
    throw new Error("Google Maps API is not configured (GOOGLE_MAPS_API_KEY missing).");
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    addressString
  )}&key=${env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  return res.json();
}
