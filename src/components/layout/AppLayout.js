import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Início', icon: HomeIcon, activeIcon: HomeIconFilled },
  { to: '/trilha', label: 'Trilha', icon: BookIcon, activeIcon: BookIconFilled },
  { to: '/simulado', label: 'Simulado', icon: TimerIcon, activeIcon: TimerIconFilled },
  { to: '/perfil', label: 'Perfil', icon: PersonIcon, activeIcon: PersonIconFilled },
];

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 64,
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -4px 20px rgba(13,27,42,0.06)',
    }}>
      {NAV.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to);

        return (
          <NavLink
            key={to}
            to={to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flex: 1,
              height: '100%',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 200ms ease',
            }}
          >
            <div style={{
              width: 40,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              background: isActive ? 'var(--accent-light)' : 'transparent',
              transition: 'background 200ms ease',
            }}>
              {isActive ? <ActiveIcon size={22} /> : <Icon size={22} />}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.01em',
              lineHeight: 1,
            }}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// SVG Icons
function HomeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function HomeIconFilled({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a3 3 0 003 3h10a3 3 0 003-3v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>
  );
}

function BookIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
}

function BookIconFilled({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.5 2A2.5 2.5 0 004 4.5v15A2.5 2.5 0 006.5 22H20a1 1 0 000-2H6.5A.5.5 0 016 19.5V17h14V2H6.5z"/>
    </svg>
  );
}

function TimerIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function TimerIconFilled({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm.5 5a.5.5 0 00-1 0v5.25l3.5 2a.5.5 0 00.5-.866L13 12.134V7z"/>
    </svg>
  );
}

function PersonIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function PersonIconFilled({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z"/>
    </svg>
  );
}
