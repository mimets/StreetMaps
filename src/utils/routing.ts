import {
  HIGH_SPEED_WARNING_THRESHOLD_KMH,
  ORS_AVOID_FEATURES,
  ORS_BASE_URL,
  ORS_API_KEY,
  ORS_SNAPPING_RADIUS_METERS,
  ROUTE_PROFILE,
} from "../constants";
import type { LatLng, RouteData, RouteDirection } from "../types";
import { formatEta } from "./format";

type OrsRouteResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number][];
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
      segments?: Array<{
        distance?: number;
        duration?: number;
        steps?: Array<{
          instruction?: string;
          distance?: number;
          duration?: number;
          name?: string;
        }>;
      }>;
    };
  }>;
};

export function buildOrsRouteRequest(origin: LatLng, destination: LatLng) {
  return {
    coordinates: [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ],
    radiuses: [ORS_SNAPPING_RADIUS_METERS, ORS_SNAPPING_RADIUS_METERS],
    instructions: true,
    instructions_format: "text",
    language: "it",
    maneuvers: true,
    geometry: true,
    geometry_simplify: false,
    continue_straight: false,
    units: "m",
    preference: "recommended",
    options: {
      avoid_features: [...ORS_AVOID_FEATURES],
    },
  };
}

export async function fetchOrsRoute(origin: LatLng, destination: LatLng): Promise<RouteData> {
  if (ORS_API_KEY === "INSERISCI_LA_TUA_CHIAVE_ORS") {
    throw new Error("Inserisci una chiave valida in ORS_API_KEY.");
  }

  const response = await fetch(`${ORS_BASE_URL}/${ROUTE_PROFILE}/geojson`, {
    method: "POST",
    headers: {
      Authorization: ORS_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/geo+json, application/json",
    },
    body: JSON.stringify(buildOrsRouteRequest(origin, destination)),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Impossibile calcolare il percorso.");
  }

  const data = (await response.json()) as OrsRouteResponse;
  const feature = data.features?.[0];
  const geometry = feature?.geometry?.coordinates ?? [];
  const summary = feature?.properties?.summary;
  const segments = feature?.properties?.segments ?? [];

  if (!geometry.length || !summary?.distance) {
    throw new Error("Nessun percorso trovato.");
  }

  const distanceMeters = summary.distance;
  const etaMinutes = (distanceMeters / 1000 / 40) * 60;
  const directions = buildDirections(segments);
  const hasSpeedWarning = directions.some((direction) => direction.speedKmh >= HIGH_SPEED_WARNING_THRESHOLD_KMH);

  return {
    coordinates: geometry,
    distanceMeters,
    etaMinutes,
    directions,
    hasSpeedWarning,
    summaryText: `${formatEta(etaMinutes)} stimati a 40 km/h`,
  };
}

function buildDirections(
  segments: Array<{
    distance?: number;
    duration?: number;
    steps?: Array<{
      instruction?: string;
      distance?: number;
      duration?: number;
      name?: string;
    }>;
  }>,
): RouteDirection[] {
  return segments.flatMap((segment) => {
    return (segment.steps ?? [])
      .map((step) => {
        const distanceMeters = step.distance ?? 0;
        const durationSeconds = step.duration ?? 0;
        const speedKmh =
          durationSeconds > 0 ? (distanceMeters / 1000 / (durationSeconds / 3600)) : 0;
        const instruction = [step.instruction, step.name].filter(Boolean).join(" ").trim();

        if (!instruction) {
          return null;
        }

        return {
          text: instruction,
          distanceMeters,
          durationSeconds,
          speedKmh,
        };
      })
      .filter((direction): direction is RouteDirection => direction !== null);
  });
}
