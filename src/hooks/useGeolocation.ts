import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GPS_GOOD_ACCURACY_METERS,
  GPS_PRECISE_ACCURACY_METERS,
  LIVE_TRAIL_MAX_POINTS,
  LIVE_TRAIL_MIN_STEP_METERS,
} from "../constants";
import type { LatLng, TrailPoint, TrackingStatus } from "../types";
import { haversineDistanceMeters } from "../utils/geometry";

type GeolocationState = {
  position: LatLng | null;
  accuracyMeters: number | null;
  isGoodAccuracy: boolean;
  isPreciseAccuracy: boolean;
  speedKmh: number | null;
  heading: number | null;
  trail: TrailPoint[];
  lastFixAt: number | null;
  status: TrackingStatus;
  error: string | null;
  isWatching: boolean;
  startTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  toggleTracking: () => void;
};

function toSpeedKmh(speedMetersPerSecond: number | null | undefined): number | null {
  if (typeof speedMetersPerSecond !== "number" || !Number.isFinite(speedMetersPerSecond)) {
    return null;
  }

  return speedMetersPerSecond * 3.6;
}

export function useGeolocation(): GeolocationState {
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<LatLng | null>(null);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [lastFixAt, setLastFixAt] = useState<number | null>(null);
  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isGoodAccuracy, setIsGoodAccuracy] = useState(false);
  const [isPreciseAccuracy, setIsPreciseAccuracy] = useState(false);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const appendTrailPoint = useCallback((nextPoint: TrailPoint) => {
    setTrail((currentTrail) => {
      const previousPoint = currentTrail[currentTrail.length - 1];
      if (previousPoint) {
        const movedMeters = haversineDistanceMeters(previousPoint, nextPoint);
        if (movedMeters < LIVE_TRAIL_MIN_STEP_METERS) {
          return currentTrail;
        }
      }

      const nextTrail = [...currentTrail, nextPoint];
      if (nextTrail.length > LIVE_TRAIL_MAX_POINTS) {
        return nextTrail.slice(nextTrail.length - LIVE_TRAIL_MAX_POINTS);
      }

      return nextTrail;
    });
  }, []);

  const startWatching = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocalizzazione non supportata dal browser.");
      setStatus("error");
      return;
    }

    if (watchIdRef.current !== null) {
      setStatus("watching");
      return;
    }

    setError(null);
    setStatus("watching");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const nextPosition = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        };

        setPosition(nextPosition);
        setAccuracyMeters(geoPosition.coords.accuracy);
        const goodAccuracy = geoPosition.coords.accuracy <= GPS_GOOD_ACCURACY_METERS;
        setIsGoodAccuracy(goodAccuracy);
        setIsPreciseAccuracy(geoPosition.coords.accuracy <= GPS_PRECISE_ACCURACY_METERS);
        setSpeedKmh(toSpeedKmh(geoPosition.coords.speed));
        setHeading(geoPosition.coords.heading ?? null);
        setLastFixAt(Date.now());
        lastPositionRef.current = nextPosition;
        appendTrailPoint({
          ...nextPosition,
          accuracyMeters: geoPosition.coords.accuracy,
          speedKmh: toSpeedKmh(geoPosition.coords.speed),
          timestamp: Date.now(),
        });
        setError(null);
        setStatus("watching");
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Permesso GPS negato dal browser.");
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError("Posizione GPS non disponibile.");
        } else if (geoError.code === geoError.TIMEOUT) {
          setError("Timeout GPS: riprova in una zona con segnale migliore.");
        } else {
          setError(geoError.message || "Impossibile ottenere la posizione.");
        }
        setStatus("error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 12000,
      },
    );
  }, [appendTrailPoint]);

  const pauseTracking = useCallback(() => {
    stopWatching();
    setStatus("paused");
  }, [stopWatching]);

  const resumeTracking = useCallback(() => {
    startWatching();
  }, [startWatching]);

  const toggleTracking = useCallback(() => {
    if (watchIdRef.current === null) {
      startWatching();
      return;
    }

    pauseTracking();
  }, [pauseTracking, startWatching]);

  useEffect(() => {
    startWatching();
    return () => {
      stopWatching();
    };
  }, [startWatching, stopWatching]);

  const isWatching = useMemo(() => status === "watching", [status]);

  return {
    position,
    accuracyMeters,
    isGoodAccuracy,
    isPreciseAccuracy,
    speedKmh,
    heading,
    trail,
    lastFixAt,
    status,
    error,
    isWatching,
    startTracking: startWatching,
    pauseTracking,
    resumeTracking,
    toggleTracking,
  };
}
