import { useEffect, useState } from 'react';
import axios from 'axios';

interface Entry { id: string; name: string; points: number; school?: string }

export function LeaderboardTable({ mode }: { mode: 'individual' | 'school' }) {
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/leaderboard?mode=${mode}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [mode]);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500">
          <th className="py-1">Rank</th>
          <th className="py-1">{mode === 'individual' ? 'Student' : 'School'}</th>
          <th className="py-1 text-right">Points</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, i) => (
          <tr key={e.id} className="border-t">
            <td className="py-1 w-14">#{i + 1}</td>
            <td className="py-1 font-medium">{e.name}</td>
            <td className="py-1 text-right font-semibold">{e.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
