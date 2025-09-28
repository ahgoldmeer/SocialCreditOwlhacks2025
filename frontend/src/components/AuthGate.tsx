import { ReactNode, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api } from '../api/client';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, loginWithRedirect, getAccessTokenSilently, error } = useAuth0();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      if (isLoading) return;
      if (!isAuthenticated) {
        await loginWithRedirect();
        return;
      }
      try {
        const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
        const token = await getAccessTokenSilently(audience ? { authorizationParams: { audience } } : {});
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.get('/auth/me');
      } catch (e) {
        console.error('Auth init failed', e);
      } finally {
        setInitialized(true);
      }
    })();
  }, [isLoading, isAuthenticated, getAccessTokenSilently, loginWithRedirect]);

  if (isLoading || !initialized) return <p className="p-4 text-sm text-gray-500">Authenticating...</p>;
  if (error) return <p className="p-4 text-sm text-red-600">{error.message}</p>;
  return <>{children}</>;
}
