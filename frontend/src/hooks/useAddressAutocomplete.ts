import { useEffect, useRef, useState } from 'react';

export interface AddressSuggestion {
  id: string;
  label: string;            // Original display_name from Nominatim
  normalized: string;       // Condensed form: number street, city, ST ZIP
  number?: string;
  street?: string;
  city?: string;
  state?: string;           // Full state name
  stateCode?: string;       // State abbreviation if available
  zip?: string;
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
            // Need address details to build normalized components
          addressdetails: '1',
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
        // Simple state abbreviation map (extend as needed)
        const STATE_ABBR: Record<string, string> = {
          'Alabama': 'AL','Alaska': 'AK','Arizona': 'AZ','Arkansas': 'AR','California': 'CA','Colorado': 'CO','Connecticut': 'CT','Delaware': 'DE','District of Columbia': 'DC','Florida': 'FL','Georgia': 'GA','Hawaii': 'HI','Idaho': 'ID','Illinois': 'IL','Indiana': 'IN','Iowa': 'IA','Kansas': 'KS','Kentucky': 'KY','Louisiana': 'LA','Maine': 'ME','Maryland': 'MD','Massachusetts': 'MA','Michigan': 'MI','Minnesota': 'MN','Mississippi': 'MS','Missouri': 'MO','Montana': 'MT','Nebraska': 'NE','Nevada': 'NV','New Hampshire': 'NH','New Jersey': 'NJ','New Mexico': 'NM','New York': 'NY','North Carolina': 'NC','North Dakota': 'ND','Ohio': 'OH','Oklahoma': 'OK','Oregon': 'OR','Pennsylvania': 'PA','Rhode Island': 'RI','South Carolina': 'SC','South Dakota': 'SD','Tennessee': 'TN','Texas': 'TX','Utah': 'UT','Vermont': 'VT','Virginia': 'VA','Washington': 'WA','West Virginia': 'WV','Wisconsin': 'WI','Wyoming': 'WY'
        };
        for (const r of data) {
          const lat = parseFloat(r.lat); const lon = parseFloat(r.lon);
          if (restrictToPhiladelphia) {
            if (!(lat >= PHILLY_BOUNDS.minLat && lat <= PHILLY_BOUNDS.maxLat && lon >= PHILLY_BOUNDS.minLon && lon <= PHILLY_BOUNDS.maxLon)) {
              continue;
            }
          }
          const addr = r.address || {};
          const number = addr.house_number || undefined;
          const street = addr.road || addr.residential || addr.pedestrian || addr.path || addr.cycleway || addr.footway || undefined;
          const city = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.county || undefined;
          const stateFull = addr.state || undefined;
          const stateCode = stateFull ? STATE_ABBR[stateFull] || undefined : undefined;
          const zip = addr.postcode || undefined;
          // Build normalized: number street, city, ST zip (skip blanks gracefully)
          const parts: string[] = [];
          const lineLeft: string[] = [];
          if (number) lineLeft.push(number);
          if (street) lineLeft.push(street);
          if (lineLeft.length) parts.push(lineLeft.join(' '));
          const lineMid: string[] = [];
          if (city) lineMid.push(city);
          if (stateCode) lineMid.push(stateCode); else if (stateFull) lineMid.push(stateFull);
          if (zip) lineMid.push(zip);
          if (lineMid.length) parts.push(lineMid.join(', '));
          const normalized = parts.join(', ');
          mapped.push({
            id: r.place_id?.toString() || `${lat},${lon}`,
            label: r.display_name,
            normalized: normalized || r.display_name,
            number, street, city, state: stateFull, stateCode, zip,
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
