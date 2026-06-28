import React, { useState, useEffect } from 'react';
import './index.css';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Commit from './pages/Commit';
import Calendar from './pages/Calendar';
import Study from './pages/Study';
import Consult from './pages/Consult';

type Page = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'goals' | 'study' | 'consult' | 'commit' | 'calendar';

const ONBOARDING_KEY = 'careerpath_onboarded';

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    goals: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
    study: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
      </svg>
    ),
    consult: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        <circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function App() {
  const [page, setPage] = useState<Page>('auth');
  const { user, loading, signOut, profile } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'ホーム' },
    { id: 'goals', label: '目標' },
    { id: 'study', label: '学習' },
    { id: 'consult', label: 'AI相談' },
    { id: 'calendar', label: '記録' },
  ] as const;

  useEffect(() => {
    if (!loading) {
      if (user) {
        const alreadyOnboarded = localStorage.getItem(ONBOARDING_KEY);
        setPage(alreadyOnboarded ? 'dashboard' : 'onboarding');
      } else {
        setPage('auth');
      }
    }
  }, [user, loading]);

  const handleAuthComplete = () => {
    const alreadyOnboarded = localStorage.getItem(ONBOARDING_KEY);
    setPage(alreadyOnboarded ? 'dashboard' : 'onboarding');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setPage('dashboard');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1f3d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#2ec98a', fontSize: 24, fontWeight: 700 }}>C</div>
      </div>
    );
  }

  if (page === 'auth') return <Auth onComplete={handleAuthComplete} />;
  if (page === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div>
      {page === 'dashboard' && <Dashboard onNavigate={(p) => setPage(p as Page)} />}
      {page === 'goals' && <Goals />}
      {page === 'study' && <Study />}
      {page === 'consult' && <Consult />}
      {page === 'calendar' && <Calendar />}

      <nav className="bottom-nav">
        {navItems.map(item => (
          <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
            <NavIcon name={item.id} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
