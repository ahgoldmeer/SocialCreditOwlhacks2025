import { useState } from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';

export function Leaderboard() {
  const [mode, setMode] = useState<'individual' | 'school'>('individual');
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border bg-white p-1">
        <button
          onClick={() => setMode('individual')}
          className={`px-3 py-1 text-sm rounded ${mode === 'individual' ? 'bg-temple-red text-white' : ''}`}
        >
          Individual
        </button>
        <button
          onClick={() => setMode('school')}
          className={`px-3 py-1 text-sm rounded ${mode === 'school' ? 'bg-temple-red text-white' : ''}`}
        >
          Schools
        </button>
      </div>
      <LeaderboardTable mode={mode} />
    </div>
  );
}
