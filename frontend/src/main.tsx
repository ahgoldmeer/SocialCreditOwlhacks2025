import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

if (!domain || !clientId) {
  // Provide a clear console error to help dev see missing configuration.
  // eslint-disable-next-line no-console
  console.error('Auth0 configuration missing: ensure VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are set in your frontend .env file.');
}

const RootApp = (
  <React.StrictMode>
    {domain && clientId ? (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          ...(audience ? { audience } : {})
        }}
        cacheLocation="localstorage"
        useRefreshTokens
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    ) : (
      <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
        <h2>Missing Auth0 Environment Variables</h2>
        <p>Please add the following to <code>frontend/.env</code> (then restart dev server):</p>
        <pre style={{ background:'#f5f5f5', padding:'0.75rem', borderRadius:4 }}>
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=yourClientId
VITE_AUTH0_AUDIENCE=https://your-api-identifier (optional)
        </pre>
      </div>
    )}
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(RootApp);
