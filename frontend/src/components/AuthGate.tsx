import { ReactNode, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api/client';

export function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await api.get('/auth/me');
        setReady(true);
      } catch {
        setReady(true); // still allow; could redirect to login page in future
      }
    })();
  }, []);

  if (!ready) return <p className="p-4 text-sm text-gray-500">Checking auth...</p>;
  if (error) return <p className="p-4 text-sm text-red-600">{error}</p>;
  return <>{children}</>;
}
