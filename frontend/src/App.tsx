import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { SubmitCleanup } from './pages/SubmitCleanup';
import { SchoolGate } from './components/SchoolGate';
import { AuthGate } from './components/AuthGate';
import { cn } from './lib/utils';
import { useAuth0 } from '@auth0/auth0-react';

function NavBar() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/submit', label: 'Submit Cleanup' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t md:static md:top-0 md:border-b md:py-2">
      {links.map(l => (
        <Link
          key={l.to}
            to={l.to}
            className={cn('flex-1 text-center py-3 md:py-2 text-sm font-medium',
              location.pathname === l.to ? 'text-temple-red' : 'text-gray-500 hover:text-gray-900')}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export default function App() {
  const { logout, user } = useAuth0();

  return (
    <AuthGate>
      <SchoolGate>
        <div className="min-h-screen pb-16 md:pb-0 flex flex-col">
          <header className="hidden md:block border-b bg-white">
            <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
              <h1 className="font-bold text-lg">Philly Campus Cleanups</h1>
              <div className="flex items-center space-x-4">
                {user?.email && (
                  <span className="text-sm font-medium text-gray-500">{user.email}</span>
                )}
                <button
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-4xl p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/submit" element={<SubmitCleanup />} />
            </Routes>
          </main>
          <NavBar />
        </div>
      </SchoolGate>
    </AuthGate>
  );
}
