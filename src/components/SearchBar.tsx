import { useEffect, useRef, useState } from "react";
import type { DestinationOption } from "../types";
import { useNominatimSearch } from "../hooks/useNominatimSearch";

type SearchBarProps = {
  onSelectDestination: (destination: DestinationOption) => void;
};

export function SearchBar({ onSelectDestination }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { results, loading, error } = useNominatimSearch(query);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function chooseDestination(destination: DestinationOption) {
    setQuery(destination.label);
    setIsOpen(false);
    onSelectDestination(destination);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
        Destinazione
      </label>
      <div className="relative">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cerca un indirizzo, una piazza o un negozio in Italia"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-16 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-brand-500/60 focus:bg-white/8"
        />
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
          {loading ? "..." : "OSM"}
        </div>
      </div>
      <div className="mt-2 min-h-5 text-sm text-white/55">
        {error ? error : "Autocomplete gratuito via Nominatim, nessuna chiave richiesta."}
      </div>
      {isOpen && (query.trim() || results.length > 0) ? (
        <div className="absolute z-20 mt-3 max-h-72 w-full overflow-auto rounded-3xl border border-white/10 bg-surface-900/95 p-2 shadow-2xl shadow-black/35 backdrop-blur">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.placeId}
                type="button"
                onClick={() => chooseDestination(result)}
                className="flex w-full items-start rounded-2xl px-3 py-3 text-left transition hover:bg-white/6"
              >
                <span className="mr-3 mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-500">
                  ●
                </span>
                <span className="block">
                  <span className="block text-sm font-semibold text-white">{result.label}</span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-white/45">Nessun risultato trovato.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
