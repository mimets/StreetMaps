import { useEffect, useRef, useState } from "react";
import { Map } from "./components/Map";
import { RoutePanel } from "./components/RoutePanel";
import { SearchBar } from "./components/SearchBar";
import { AUTO_REROUTE_COOLDOWN_MS, OFF_ROUTE_REROUTE_MIN_METERS } from "./constants";
import { useGeolocation } from "./hooks/useGeolocation";
import { useReverseGeocode } from "./hooks/useReverseGeocode";
import { useRouting } from "./hooks/useRouting";
import type { DestinationOption } from "./types";

export default function App() {
  const geolocation = useGeolocation();
  const {
    position,
    accuracyMeters,
    speedKmh,
    heading,
    trail,
    lastFixAt,
    status,
    error: geoError,
    isWatching,
    toggleTracking,
  } = geolocation;
  const { result: currentAddress, loading: currentAddressLoading, error: currentAddressError } =
    useReverseGeocode(position);
  const { route, loading, error, offRoute, offRouteDistanceMeters, calculateRoute, clearRoute } =
    useRouting(position);
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [followUser, setFollowUser] = useState(true);
  const [centerSignal, setCenterSignal] = useState(0);
  const lastAutoRerouteRef = useRef<number>(0);

  async function handleSelectDestination(nextDestination: DestinationOption) {
    setDestination(nextDestination);
    if (position) {
      await calculateRoute(position, {
        lat: nextDestination.lat,
        lng: nextDestination.lng,
      });
    }
    setFollowUser(true);
  }

  async function handleRecalculate() {
    if (position && destination) {
      await calculateRoute(position, {
        lat: destination.lat,
        lng: destination.lng,
      });
    }
  }

  function handleShareTrip() {
    const shareTextParts = ["Cinquantino GPS"];
    if (route) {
      shareTextParts.push(`Percorso: ${Math.round(route.distanceMeters / 1000)} km, ETA ${Math.round(route.etaMinutes)} min`);
    }
    if (currentAddress?.label) {
      shareTextParts.push(`Posizione: ${currentAddress.label}`);
    } else if (position) {
      shareTextParts.push(`Posizione: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`);
    }

    const shareText = shareTextParts.join(" | ");

    if (navigator.share) {
      void navigator.share({
        title: "Cinquantino GPS",
        text: shareText,
      });
      return;
    }

    void navigator.clipboard.writeText(shareText);
  }

  useEffect(() => {
    if (position && destination && !route && !loading) {
      void calculateRoute(position, {
        lat: destination.lat,
        lng: destination.lng,
      });
    }
  }, [calculateRoute, destination, loading, position, route]);

  useEffect(() => {
    if (!position || !destination || !route || !offRoute || loading) {
      return;
    }

    const offRouteMeters = offRouteDistanceMeters ?? 0;
    const now = Date.now();
    if (offRouteMeters < OFF_ROUTE_REROUTE_MIN_METERS) {
      return;
    }
    if (now - lastAutoRerouteRef.current < AUTO_REROUTE_COOLDOWN_MS) {
      return;
    }

    lastAutoRerouteRef.current = now;
    void calculateRoute(position, {
      lat: destination.lat,
      lng: destination.lng,
    });
  }, [calculateRoute, destination, loading, offRoute, offRouteDistanceMeters, position, route]);

  function centerOnUser() {
    setFollowUser(true);
    setCenterSignal((currentValue) => currentValue + 1);
  }

  return (
    <div className="relative h-screen overflow-hidden bg-surface-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_22%),linear-gradient(180deg,#07101d_0%,#050A12_58%,#04060b_100%)]" />
      <div className="relative h-full">
        <header className="absolute left-0 right-0 top-0 z-[1200] flex items-center justify-between gap-3 border-b border-white/8 bg-surface-950/80 px-4 py-4 backdrop-blur md:px-6">
          <div>
            <div className="font-display text-[1.15rem] font-bold tracking-tight text-white sm:text-[1.35rem]">
              Cinquantino GPS <span className="text-brand-500">🛵</span>
            </div>
            <div className="mt-1 max-w-[14rem] text-xs font-medium text-white/50 sm:max-w-none">
              Navigatore per ciclomotori 50cc in Italia
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={centerOnUser}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-brand-500/50 hover:text-brand-500 sm:px-3 sm:text-[11px] sm:tracking-[0.24em]"
            >
              Centra
            </button>
            <button
              type="button"
              onClick={toggleTracking}
              className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-500 transition hover:bg-brand-500/15 sm:px-3 sm:text-[11px] sm:tracking-[0.24em]"
            >
              {status === "error" ? "Riprova GPS" : isWatching ? "Pausa GPS" : "Riprendi GPS"}
            </button>
            <button
              type="button"
              onClick={() => setFollowUser((currentValue) => !currentValue)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-brand-500/50 hover:text-brand-500 sm:px-3 sm:text-[11px] sm:tracking-[0.24em]"
            >
              {followUser ? "Segui ON" : "Segui OFF"}
            </button>
          </div>
        </header>

        <main className="absolute inset-0 pt-[78px] md:flex md:pt-[78px]">
          <section className="absolute inset-0 md:relative md:flex-1">
            <Map
              currentPosition={position}
              destination={destination}
              route={route}
              trail={trail}
              hasLocation={Boolean(position)}
              offRoute={offRoute}
              followUser={followUser}
              centerSignal={centerSignal}
            />
            <div className="pointer-events-none absolute left-4 top-4 z-[1100] rounded-2xl border border-white/10 bg-surface-950/85 px-4 py-3 text-sm text-white/75 backdrop-blur">
              {geoError ? (
                <span className="text-red-200">{geoError}</span>
              ) : position ? (
                <>
                  Posizione acquisita{" "}
                  <span className="text-white/45">
                    · precisione {Math.round(accuracyMeters ?? 0)} m
                  </span>
                </>
              ) : (
                "In attesa del GPS del browser..."
              )}
            </div>
          </section>

          <aside className="absolute inset-x-0 bottom-0 z-[1200] flex max-h-[68vh] min-h-0 flex-col border-t border-white/8 bg-surface-950 px-4 pb-5 pt-4 backdrop-blur-xl md:static md:max-h-none md:w-[430px] md:border-l md:border-t-0 md:px-5">
            <div className="mb-4 rounded-3xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50">
              Percorso calcolato evitando autostrade e superstrade (tipo A e B).
              Rispetta sempre la segnaletica locale.
            </div>

            <div className="mb-4">
              <SearchBar onSelectDestination={handleSelectDestination} />
            </div>

            <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {geoError
                ? geoError
                : status === "watching"
                ? "GPS attivo e in aggiornamento continuo."
                : status === "paused"
                  ? "GPS in pausa."
                  : "Attiva la posizione per seguire il tragitto."}
            </div>

            <div className="min-h-0 flex-1 overflow-auto pr-1">
              <RoutePanel
                route={route}
                loading={loading}
                error={error}
                offRoute={offRoute}
                offRouteDistanceMeters={offRouteDistanceMeters}
                hasLocation={Boolean(position)}
                onRecalculate={handleRecalculate}
                onClearRoute={() => {
                  clearRoute();
                  setDestination(null);
                }}
                canNavigate={Boolean(position && destination)}
                trackingStatus={status}
                speedKmh={speedKmh}
                heading={heading}
                accuracyMeters={accuracyMeters}
                lastFixAt={lastFixAt}
                currentAddress={currentAddress}
                currentAddressLoading={currentAddressLoading}
                currentAddressError={currentAddressError}
                trailCount={trail.length}
                onToggleTracking={toggleTracking}
                onShareTrip={handleShareTrip}
              />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
