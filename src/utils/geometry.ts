import type { LatLng } from "../types";
import { clamp } from "./format";

const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function haversineDistanceMeters(first: LatLng, second: LatLng): number {
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function project(point: LatLng, refLatRadians: number): { x: number; y: number } {
  const latRadians = toRadians(point.lat);
  const lngRadians = toRadians(point.lng);
  return {
    x: EARTH_RADIUS_METERS * lngRadians * Math.cos(refLatRadians),
    y: EARTH_RADIUS_METERS * latRadians,
  };
}

function distancePointToSegment(point: LatLng, segmentStart: LatLng, segmentEnd: LatLng): number {
  const refLatRadians = toRadians(point.lat);
  const p = project(point, refLatRadians);
  const a = project(segmentStart, refLatRadians);
  const b = project(segmentEnd, refLatRadians);

  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const apX = p.x - a.x;
  const apY = p.y - a.y;
  const lengthSquared = abX * abX + abY * abY;

  if (!lengthSquared) {
    return Math.hypot(apX, apY);
  }

  const t = clamp((apX * abX + apY * abY) / lengthSquared, 0, 1);
  const closestX = a.x + abX * t;
  const closestY = a.y + abY * t;

  return Math.hypot(p.x - closestX, p.y - closestY);
}

export function distanceToRouteMeters(point: LatLng, route: [number, number][]): number {
  if (route.length < 2) {
    return Number.POSITIVE_INFINITY;
  }

  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentStart: LatLng = { lat: route[index][1], lng: route[index][0] };
    const segmentEnd: LatLng = { lat: route[index + 1][1], lng: route[index + 1][0] };
    const current = distancePointToSegment(point, segmentStart, segmentEnd);
    if (current < bestDistance) {
      bestDistance = current;
    }
  }

  return bestDistance;
}
