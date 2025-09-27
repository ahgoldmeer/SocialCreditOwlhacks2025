import { useEffect, useRef, useState } from 'react';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: { value: string; normalized: string; lat: number; lon: number }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false);
  // NOTE: Default minLength in hook is 3; keep in sync if changed.
  const MIN_LENGTH = 3;
  const { suggestions, loading, error } = useAddressAutocomplete(value, { restrictToPhiladelphia: true, limit: 6, minLength: MIN_LENGTH });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(idx: number) {
    const s = suggestions[idx];
    if (!s) return;
    onSelect({ value: s.normalized, normalized: s.normalized, lat: s.lat, lon: s.lon });
    setOpen(false);
  }

  // Open panel when we begin loading (so user sees spinner / messages) or when new suggestions arrive.
  useEffect(() => {
    if ((loading && value.trim().length >= MIN_LENGTH) || suggestions.length) {
      setOpen(true);
    }
  }, [loading, suggestions, value]);

  return (
    <div ref={containerRef} className="relative">
      <textarea
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onFocus={() => value.trim().length >= MIN_LENGTH && setOpen(true)}
        rows={2}
        placeholder={placeholder || `Start typing (min ${MIN_LENGTH} chars)...`}
        className="w-full rounded-md border p-2 text-sm resize-none"
      />
      {open && value.trim().length >= MIN_LENGTH && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow">
          {loading && <p className="p-2 text-xs text-gray-500">Searching…</p>}
          {!loading && !suggestions.length && !error && <p className="p-2 text-xs text-gray-500">No results</p>}
          {error && <p className="p-2 text-xs text-red-600">{error}</p>}
          <ul className="divide-y">
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(i)}
                  className="block w-full text-left px-3 py-2 hover:bg-temple-red/10 focus:bg-temple-red/10 text-xs"
                >
                  <span className="font-medium">{s.normalized}</span>
                  {s.normalized !== s.label && (
                    <span className="block text-[10px] text-gray-500 truncate">{s.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
