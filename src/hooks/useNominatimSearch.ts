import { useEffect, useState } from "react";
import { NOMINATIM_BASE_URL } from "../constants";
import type { DestinationOption } from "../types";

type SearchState = {
  results: DestinationOption[];
  loading: boolean;
  error: string | null;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export function useNominatimSearch(query: string): SearchState {
  const [results, setResults] = useState<DestinationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(NOMINATIM_BASE_URL);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("q", query);
        url.searchParams.set("limit", "5");
        url.searchParams.set("countrycodes", "it");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("accept-language", "it");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Autocomplete non disponibile.");
        }

        const items = (await response.json()) as NominatimResult[];
        setResults(
          items.map((item) => ({
            placeId: String(item.place_id),
            label: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
          })),
        );
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) {
          setError(cause instanceof Error ? cause.message : "Errore di ricerca.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, error };
}
