import { formatDistance, formatEta } from "../utils/format";
import type { RouteData, TrackingStatus } from "../types";

type RoutePanelProps = {
  route: RouteData | null;
  loading: boolean;
  error: string | null;
  offRoute: boolean;
  offRouteDistanceMeters: number | null;
  hasLocation: boolean;
  onRecalculate: () => void;
  onClearRoute: () => void;
  canNavigate: boolean;
  trackingStatus: TrackingStatus;
  speedKmh: number | null;
  heading: number | null;
  accuracyMeters: number | null;
  lastFixAt: number | null;
  trailCount: number;
  onToggleTracking: () => void;
  onShareTrip: () => void;
};

function formatFixAge(lastFixAt: number | null): string {
  if (!lastFixAt) {
    return "Nessun fix";
  }

  const seconds = Math.max(0, Math.round((Date.now() - lastFixAt) / 1000));
  if (seconds < 60) {
    return `${seconds}s fa`;
  }

  const minutes = Math.round(seconds / 60);
  return `${minutes}m fa`;
}

export function RoutePanel({
  route,
  loading,
  error,
  offRoute,
  offRouteDistanceMeters,
  hasLocation,
  onRecalculate,
  onClearRoute,
  canNavigate,
  trackingStatus,
  speedKmh,
  heading,
  accuracyMeters,
  lastFixAt,
  trailCount,
  onToggleTracking,
  onShareTrip,
}: RoutePanelProps) {
  const liveEnabled = trackingStatus === "watching";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Tracking live
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {liveEnabled ? "GPS attivo" : "GPS in pausa"}
            </div>
            <div className="mt-1 text-sm text-white/60">
              {formatFixAge(lastFixAt)} · {trailCount} punti traccia
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleTracking}
            className="rounded-full border border-white/10 bg-surface-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-brand-500/50 hover:text-brand-500"
          >
            {liveEnabled ? "Pausa" : "Riprendi"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-surface-900/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Velocità</div>
            <div className="mt-2 text-xl font-bold text-white">
              {speedKmh !== null ? `${Math.round(speedKmh)} km/h` : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-surface-900/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Precisione</div>
            <div className="mt-2 text-xl font-bold text-white">
              {accuracyMeters !== null ? `${Math.round(accuracyMeters)} m` : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-surface-900/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Direzione</div>
            <div className="mt-2 text-xl font-bold text-white">
              {heading !== null ? `${Math.round(heading)}°` : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-surface-900/70 p-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Stato</div>
            <div className="mt-2 text-xl font-bold text-white">
              {hasLocation ? "Live" : "In attesa"}
            </div>
          </div>
        </div>
      </div>

      {route ? (
        <div className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4 shadow-glow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-500">
                Percorso pronto
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {formatDistance(route.distanceMeters)}
              </div>
              <div className="mt-1 text-sm text-white/70">{route.summaryText}</div>
            </div>
            <button
              type="button"
              onClick={onClearRoute}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Reset
            </button>
          </div>

          {route.hasSpeedWarning ? (
            <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Attenzione: alcuni segmenti mostrano una velocità anomala. Verifica sempre
              il rispetto della segnaletica locale.
            </div>
          ) : null}

          {offRoute ? (
            <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              Sei fuori dal percorso
              {offRouteDistanceMeters ? ` di circa ${formatDistance(offRouteDistanceMeters)}.` : "."}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onRecalculate}
              disabled={!canNavigate || loading}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-4 text-base font-extrabold text-surface-950 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {offRoute ? "Ricalcola" : "VAI"}
            </button>
            <button
              type="button"
              onClick={onShareTrip}
              disabled={!route}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-surface-950 px-5 py-4 text-base font-extrabold text-white transition hover:border-brand-500/50 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Condividi
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/70">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            Pronto all'uso
          </div>
          <p className="mt-2 text-sm leading-6">
            Cerca una destinazione in Italia, scegli un filtro e avvia un percorso per 50cc.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white/10 px-5 py-4 text-base font-extrabold text-white/35"
          >
            VAI
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Indicazioni
            </div>
            <div className="mt-1 text-sm text-white/65">
              {loading
                ? "Calcolo percorso in corso..."
                : error
                  ? error
                  : hasLocation
                    ? "Lista turn-by-turn del percorso."
                    : "Attiva la geolocalizzazione per iniziare."}
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-[32vh] space-y-3 overflow-auto pr-1">
          {route?.directions?.length ? (
            route.directions.map((direction, index) => (
              <div
                key={`${direction.text}-${index}`}
                className="rounded-2xl border border-white/8 bg-surface-900/70 px-4 py-3"
              >
                <div className="text-sm font-semibold leading-6 text-white">
                  {index + 1}. {direction.text}
                </div>
                <div className="mt-1 text-xs text-white/48">
                  {formatDistance(direction.distanceMeters)} · {Math.round(direction.speedKmh)} km/h stimati ·{" "}
                  {formatEta((direction.durationSeconds / 60) || 0)}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
              Nessuna indicazione ancora disponibile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
