export const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY ?? "INSERISCI_LA_TUA_CHIAVE_ORS";

export const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions";
export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

export const ROUTE_PROFILE = "driving-car";
export const ORS_AVOID_FEATURES = ["highways", "tollways"] as const;

export const LIVE_SPEED_KMH = 40;
export const LEGAL_MAX_SPEED_KMH = 45;
export const OFF_ROUTE_THRESHOLD_METERS = 90;
export const HIGH_SPEED_WARNING_THRESHOLD_KMH = 70;
export const LIVE_TRAIL_MAX_POINTS = 60;
export const LIVE_TRAIL_MIN_STEP_METERS = 6;
export const GPS_RECENTER_ZOOM = 16;
export const REVERSE_GEOCODE_DEBOUNCE_MS = 1200;
export const AUTO_REROUTE_COOLDOWN_MS = 20000;
export const OFF_ROUTE_REROUTE_MIN_METERS = 120;
export const GPS_GOOD_ACCURACY_METERS = 25;
export const GPS_PRECISE_ACCURACY_METERS = 10;

export const MAP_CENTER_ITALY: [number, number] = [41.9028, 12.4964];
