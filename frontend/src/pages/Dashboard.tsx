import { useEffect, useState } from 'react';
import axios from 'axios';

interface Cleanup { id: string; address: string; created_at: string; points: number }

export function Dashboard() {
  const [points, setPoints] = useState<number>(0);
  const [cleanups, setCleanups] = useState<Cleanup[]>([]);
  const [top, setTop] = useState<number>(0);

  function load() {
    axios.get('/cleanups/me').then(r => setCleanups(r.data.cleanups));
    axios.get('/users/me').then(r => setPoints(r.data.points));
    axios.get('/leaderboard?mode=individual&limit=1').then(r => setTop(r.data[0]?.points || 0));
  }

  useEffect(() => { load(); }, []);

  const progress = top ? Math.min(100, Math.round((points / top) * 100)) : 0;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Your Points</p>
          <p className="text-3xl font-bold">{points}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Progress vs #1</p>
          <div className="mt-2 h-3 w-full rounded bg-gray-200 overflow-hidden">
            <div className="h-full bg-temple-red" style={{ width: progress + '%' }} />
          </div>
          <p className="text-xs mt-1 font-medium">{progress}%</p>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Recent Cleanups</h2>
        <ul className="space-y-2">
          {cleanups.map(c => (
            <li key={c.id} className="rounded border bg-white p-3 text-sm">
              <p className="font-medium">{c.address}</p>
              <p className="text-xs text-gray-500 flex justify-between"><span>{new Date(c.created_at).toLocaleDateString()}</span><span className="font-semibold">+{c.points}</span></p>
            </li>
          ))}
          {!cleanups.length && <p className="text-sm text-gray-500">No cleanups yet. Submit your first!</p>}
        </ul>
      </section>
    </div>
  );
}
