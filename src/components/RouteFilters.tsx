import { ROUTE_FILTER_OPTIONS } from "../constants";
import type { RouteFilterState } from "../types";

type RouteFiltersProps = {
  filters: RouteFilterState;
  onChange: (filters: RouteFilterState) => void;
};

export function RouteFilters({ filters, onChange }: RouteFiltersProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
        Filtri percorso
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {ROUTE_FILTER_OPTIONS.map((option) => {
          const active = filters.preference === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  preference: option.id,
                })
              }
              className={[
                "rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-brand-500/40 bg-brand-500/15 text-white shadow-glow"
                  : "border-white/10 bg-surface-900/60 text-white/70 hover:border-brand-500/30 hover:text-white",
              ].join(" ")}
            >
              <div className="text-sm font-bold">{option.label}</div>
              <div className="mt-1 text-[11px] leading-4 text-white/50">{option.hint}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-900/60 px-3 py-3">
        <div>
          <div className="text-sm font-semibold text-white">Evita traghetti</div>
          <div className="text-[11px] text-white/45">Più coerente per il 50cc</div>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...filters,
              avoidFerries: !filters.avoidFerries,
            })
          }
          className={[
            "relative inline-flex h-8 w-14 items-center rounded-full border transition",
            filters.avoidFerries
              ? "border-brand-500/50 bg-brand-500/20"
              : "border-white/10 bg-white/5",
          ].join(" ")}
          aria-pressed={filters.avoidFerries}
        >
          <span
            className={[
              "inline-block h-6 w-6 rounded-full bg-white transition",
              filters.avoidFerries ? "translate-x-7" : "translate-x-1",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}
