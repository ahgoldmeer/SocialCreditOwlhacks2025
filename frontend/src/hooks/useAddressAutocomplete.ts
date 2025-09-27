import { useEffect, useRef, useState } from 'react';

export interface AddressSuggestion {
  id: string;
  label: string;
  lat: number;
  lon: number;
  raw: any;
}

interface Options {
  debounceMs?: number;
  limit?: number;
  restrictToPhiladelphia?: boolean;
  minLength?: number;
}

const PHILLY_BOUNDS = {
  minLat: 39.85,
  maxLat: 40.16,
  minLon: -75.32,
  maxLon: -74.96,
};

export function useAddressAutocomplete(query: string, opts: Options = {}) {
  const { debounceMs = 300, limit = 5, restrictToPhiladelphia = true, minLength = 3 } = opts;
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < minLength) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        // Add viewbox param to bias results to Philly
        const base = 'https://nominatim.openstreetmap.org/search';
        const params = new URLSearchParams({
          format: 'json',
          addressdetails: '0',
          limit: String(limit * 3), // fetch extra then filter
          q: query,
        });
        const url = `${base}?${params.toString()}`;
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'PhillyCampusCleanups/1.0 (demo)'
          }
        });
        if (!resp.ok) throw new Error('geocode failed');
        const data: any[] = await resp.json();
        const mapped: AddressSuggestion[] = [];
        for (const r of data) {
          const lat = parseFloat(r.lat); const lon = parseFloat(r.lon);
          if (restrictToPhiladelphia) {
            if (!(lat >= PHILLY_BOUNDS.minLat && lat <= PHILLY_BOUNDS.maxLat && lon >= PHILLY_BOUNDS.minLon && lon <= PHILLY_BOUNDS.maxLon)) {
              continue;
            }
          }
          mapped.push({
            id: r.place_id?.toString() || `${lat},${lon}`,
            label: r.display_name,
            lat, lon,
            raw: r,
          });
          if (mapped.length >= limit) break;
        }
        setSuggestions(mapped);
        setLoading(false);
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setLoading(false);
        setError(e?.message || 'lookup error');
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, debounceMs, limit, restrictToPhiladelphia, minLength]);

  return { suggestions, loading, error };
}
