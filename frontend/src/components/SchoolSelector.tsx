import { SCHOOL_OPTIONS } from '../lib/utils';

export function SchoolSelector({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-center text-xl font-semibold">Choose Your School</h2>
      <p className="text-center text-sm text-gray-600">Select your institution to start earning cleanup points.</p>
      <div className="grid grid-cols-2 gap-3">
        {SCHOOL_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => onSelect(s.value)}
            className="rounded-lg border bg-white p-3 text-sm font-medium shadow hover:shadow-md transition"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
