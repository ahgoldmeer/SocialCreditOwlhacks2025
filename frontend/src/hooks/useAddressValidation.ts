import { useCallback, useEffect, useRef, useState } from 'react';

export type AddressValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'error';

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
}

interface UseAddressValidationOptions {
  minLength?: number;
  debounceMs?: number;
  restrictToPhiladelphia?: boolean;
}

// Rough bounding box around Philadelphia
const PHILLY_BOUNDS = {
  minLat: 39.85,
  maxLat: 40.16,
  minLon: -75.32,
  maxLon: -74.96,
};

export function useAddressValidation(address: string, options: UseAddressValidationOptions = {}) {
  const { minLength = 5, debounceMs = 500, restrictToPhiladelphia = true } = options;
  const [status, setStatus] = useState<AddressValidationStatus>('idle');
  const [normalized, setNormalized] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [message, setMessage] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!address || address.trim().length < minLength) {
      setStatus('idle');
      setMessage(address ? 'Enter a bit more detail (street number or intersection)' : '');
      setCoords(null);
      setNormalized('');
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    setStatus('validating');
    setMessage('Validating address…');

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(address)}`;
        const resp = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'en' } });
        if (!resp.ok) throw new Error('Geocode failed');
        const data: GeocodeResult[] = await resp.json();
        if (!Array.isArray(data) || data.length === 0) {
            setStatus('invalid');
            setMessage('No matching address found');
            setCoords(null);
            setNormalized('');
            return;
        }
        // Pick first result inside bounds (if required) otherwise first overall
        let chosen: GeocodeResult | undefined;
        for (const r of data) {
          const lat = parseFloat(r.lat); const lon = parseFloat(r.lon);
          const inBounds = !restrictToPhiladelphia || (lat >= PHILLY_BOUNDS.minLat && lat <= PHILLY_BOUNDS.maxLat && lon >= PHILLY_BOUNDS.minLon && lon <= PHILLY_BOUNDS.maxLon);
          if (inBounds) { chosen = r; break; }
        }
        if (!chosen) {
          setStatus('invalid');
          setMessage(restrictToPhiladelphia ? 'Address not recognized as within Philadelphia bounds' : 'Address not accepted');
          setCoords(null);
          setNormalized('');
          return;
        }
        setStatus('valid');
        setNormalized(chosen.display_name);
        setCoords({ lat: parseFloat(chosen.lat), lon: parseFloat(chosen.lon) });
        setMessage('Address validated');
      } catch (err: any) {
        if (controller.signal.aborted) return;
        setStatus('error');
        setMessage(err?.message || 'Validation error');
        setCoords(null);
        setNormalized('');
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [address, minLength, debounceMs, restrictToPhiladelphia]);

  const forceValidate = useCallback(() => {
    // Trigger effect by updating address state externally if needed
  }, []);

  return { status, normalized, coords, message, forceValidate };
}
