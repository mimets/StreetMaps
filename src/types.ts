export type LatLng = {
  lat: number;
  lng: number;
};

export type TrailPoint = LatLng & {
  accuracyMeters: number | null;
  speedKmh: number | null;
  timestamp: number;
};

export type TrackingStatus = "idle" | "watching" | "paused" | "error";

export type RoutePreference = "recommended" | "fastest" | "shortest";

export type RouteFilterState = {
  preference: RoutePreference;
  avoidFerries: boolean;
};

export type DestinationOption = {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
};

export type RouteDirection = {
  text: string;
  distanceMeters: number;
  durationSeconds: number;
  speedKmh: number;
};

export type RouteData = {
  coordinates: [number, number][];
  distanceMeters: number;
  etaMinutes: number;
  directions: RouteDirection[];
  hasSpeedWarning: boolean;
  summaryText: string;
};

export type GeocodeResult = {
  label: string;
  city: string | null;
  road: string | null;
  suburb: string | null;
  country: string | null;
};
