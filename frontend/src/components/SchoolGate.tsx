import { ReactNode, useEffect, useState } from 'react';
import { SchoolSelector } from './SchoolSelector';

export function SchoolGate({ children }: { children: ReactNode }) {
  const [school, setSchool] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('school');
    if (stored) setSchool(stored);
  }, []);

  function handleChoose(value: string) {
    localStorage.setItem('school', value);
    setSchool(value);
  }

  if (!school) {
    return <div className="min-h-screen flex items-center justify-center p-4"><SchoolSelector onSelect={handleChoose} /></div>;
  }

  return <>{children}</>;
}
