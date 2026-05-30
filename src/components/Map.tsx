import { useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLng, RouteData, TrailPoint } from "../types";
import { MAP_CENTER_ITALY } from "../constants";

type MapProps = {
  currentPosition: LatLng | null;
  destination: LatLng | null;
  route: RouteData | null;
  trail: TrailPoint[];
  hasLocation: boolean;
  offRoute: boolean;
  followUser: boolean;
  centerSignal: number;
};

const liveIcon = L.divIcon({
  className: "live-marker",
  html: `
    <div class="relative flex h-6 w-6 items-center justify-center">
      <span class="absolute h-10 w-10 rounded-full bg-brand-500/20 animate-pulseDot"></span>
      <span class="absolute h-6 w-6 rounded-full border-2 border-white/25"></span>
      <span class="relative h-3 w-3 rounded-full bg-brand-500 shadow-[0_0_24px_rgba(255,107,0,0.9)]"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destinationIcon = L.divIcon({
  className: "destination-marker",
  html: `
    <div class="flex h-8 w-8 items-center justify-center rounded-full border border-brand-500/35 bg-surface-950 shadow-lg shadow-black/40">
      <div class="h-3 w-3 rounded-full bg-brand-500"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapViewController({
  currentPosition,
  destination,
  route,
  followUser,
  centerSignal,
}: {
  currentPosition: LatLng | null;
  destination: LatLng | null;
  route: RouteData | null;
  followUser: boolean;
  centerSignal: number;
}) {
  const map = useMap();
  const previousCenterRef = useRef<string | null>(null);
  const routeSignatureRef = useRef<string | null>(null);
  const lastCenterSignalRef = useRef<number>(0);

  useEffect(() => {
    if (route?.coordinates?.length) {
      const routeSignature = `${route.coordinates.length}:${route.coordinates[0]?.join(",")}:${route.coordinates[route.coordinates.length - 1]?.join(",")}`;

      if (routeSignatureRef.current !== routeSignature) {
        routeSignatureRef.current = routeSignature;
        const bounds = L.latLngBounds(route.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]));
        if (currentPosition) {
          bounds.extend([currentPosition.lat, currentPosition.lng]);
        }
        if (destination) {
          bounds.extend([destination.lat, destination.lng]);
        }
        map.fitBounds(bounds.pad(0.2), { animate: true });
      }

      if (followUser && currentPosition) {
        const nextKey = `${currentPosition.lat.toFixed(5)},${currentPosition.lng.toFixed(5)}`;
        if (previousCenterRef.current !== nextKey) {
          map.panTo([currentPosition.lat, currentPosition.lng], { animate: true });
          previousCenterRef.current = nextKey;
        }
      }

      return;
    }

    if (currentPosition && followUser) {
      const nextKey = `${currentPosition.lat.toFixed(5)},${currentPosition.lng.toFixed(5)}`;
      if (previousCenterRef.current !== nextKey) {
        map.setView([currentPosition.lat, currentPosition.lng], 16, { animate: true });
        previousCenterRef.current = nextKey;
      }

      if (centerSignal !== lastCenterSignalRef.current) {
        lastCenterSignalRef.current = centerSignal;
        map.setView([currentPosition.lat, currentPosition.lng], 17, { animate: true });
      }

      return;
    }

    map.setView(MAP_CENTER_ITALY, 6, { animate: false });
  }, [centerSignal, currentPosition, destination, followUser, map, route]);

  return null;
}

export function Map({
  currentPosition,
  destination,
  route,
  trail,
  hasLocation,
  offRoute,
  followUser,
  centerSignal,
}: MapProps) {
  const center = useMemo(
    () => currentPosition ?? { lat: MAP_CENTER_ITALY[0], lng: MAP_CENTER_ITALY[1] },
    [currentPosition],
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={hasLocation ? 15 : 6}
        zoomControl={false}
        className="h-full w-full"
        preferCanvas
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewController
          currentPosition={currentPosition}
          destination={destination}
          route={route}
          followUser={followUser}
          centerSignal={centerSignal}
        />

        {trail.length > 1 ? (
          <Polyline
            positions={trail.map((point) => [point.lat, point.lng] as [number, number])}
            pathOptions={{ color: "#FFB066", weight: 4, opacity: 0.6, dashArray: "8 10" }}
          />
        ) : null}

        {route?.coordinates?.length ? (
          <Polyline
            positions={route.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])}
            pathOptions={{ color: "#FF6B00", weight: 6, opacity: 0.95 }}
          />
        ) : null}

        {currentPosition ? (
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={liveIcon}>
            <Popup>
              <div className="text-sm font-semibold">Posizione live</div>
              <div className="text-xs text-slate-500">{hasLocation ? "GPS attivo" : "In attesa di segnale"}</div>
            </Popup>
          </Marker>
        ) : null}

        {destination ? <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} /> : null}

        {currentPosition ? (
          <CircleMarker
            center={[currentPosition.lat, currentPosition.lng]}
            radius={offRoute ? 18 : 14}
            pathOptions={{
              color: "#FF6B00",
              fillColor: "#FF6B00",
              fillOpacity: 0.12,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent>
              {offRoute ? "Fuori rotta" : "Sei qui"}
            </Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.12),transparent_36%),linear-gradient(to_bottom,rgba(5,10,18,0.2),rgba(5,10,18,0.7))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-950 via-surface-950/70 to-transparent" />
      <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-surface-950/80 px-3 py-2 text-xs font-semibold tracking-[0.18em] text-white/70 backdrop-blur">
        Max 45 km/h · Vietato autostrade
      </div>
    </div>
  );
}
