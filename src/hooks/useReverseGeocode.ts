import { useEffect, useState } from "react";
import { NOMINATIM_BASE_URL, REVERSE_GEOCODE_DEBOUNCE_MS } from "../constants";
import type { GeocodeResult, LatLng } from "../types";

type ReverseGeocodeState = {
  result: GeocodeResult | null;
  loading: boolean;
  error: string | null;
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

export function useReverseGeocode(position: LatLng | null): ReverseGeocodeState {
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!position) {
      setResult(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(NOMINATIM_BASE_URL.replace("/search", "/reverse"));
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", String(position.lat));
        url.searchParams.set("lon", String(position.lng));
        url.searchParams.set("zoom", "18");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("accept-language", "it");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Reverse geocoding non disponibile.");
        }

        const data = (await response.json()) as NominatimReverseResponse;
        const address = data.address ?? {};
        const road = address.road ?? address.pedestrian ?? null;
        const locality = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county ?? null;
        const label = [road, locality, address.state, address.country].filter(Boolean).join(", ");

        setResult({
          label: label || data.display_name || "Posizione corrente",
          road,
          city: locality,
          suburb: address.suburb ?? null,
          country: address.country ?? null,
        });
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) {
          setError(cause instanceof Error ? cause.message : "Impossibile leggere l'indirizzo.");
        }
      } finally {
        setLoading(false);
      }
    }, REVERSE_GEOCODE_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [position?.lat, position?.lng]);

  return { result, loading, error };
}
