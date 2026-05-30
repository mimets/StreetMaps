import { useCallback, useEffect, useState } from "react";
import { OFF_ROUTE_THRESHOLD_METERS } from "../constants";
import type { LatLng, RouteData } from "../types";
import { distanceToRouteMeters } from "../utils/geometry";
import { fetchOrsRoute } from "../utils/routing";

type RoutingState = {
  route: RouteData | null;
  loading: boolean;
  error: string | null;
  offRoute: boolean;
  offRouteDistanceMeters: number | null;
  calculateRoute: (origin: LatLng, destination: LatLng) => Promise<void>;
  clearRoute: () => void;
};

export function useRouting(currentPosition: LatLng | null): RoutingState {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offRoute, setOffRoute] = useState(false);
  const [offRouteDistanceMeters, setOffRouteDistanceMeters] = useState<number | null>(null);

  const calculateRoute = useCallback(async (origin: LatLng, nextDestination: LatLng) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchOrsRoute(origin, nextDestination);
      setRoute(result);
      setOffRoute(false);
      setOffRouteDistanceMeters(null);
    } catch (cause) {
      setRoute(null);
      setError(cause instanceof Error ? cause.message : "Errore sconosciuto.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setOffRoute(false);
    setOffRouteDistanceMeters(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!currentPosition || !route?.coordinates.length) {
      setOffRoute(false);
      setOffRouteDistanceMeters(null);
      return;
    }

    const distance = distanceToRouteMeters(currentPosition, route.coordinates);
    setOffRouteDistanceMeters(distance);
    setOffRoute(distance > OFF_ROUTE_THRESHOLD_METERS);
  }, [currentPosition, route]);

  return {
    route,
    loading,
    error,
    offRoute,
    offRouteDistanceMeters,
    calculateRoute,
    clearRoute,
  };
}
