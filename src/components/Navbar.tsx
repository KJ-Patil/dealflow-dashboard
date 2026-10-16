'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { toggleTheme, logout } from '@/src/store/uiSlice';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/deals', label: 'Deals' },
  { href: '/investments', label: 'Investments' },
  { href: '/corporate', label: 'Corporate' },
] as const;

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      {open ? (
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      ) : (
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      )}
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const userName = useAppSelector((s) => s.ui.userName);
  const [menuOpen, setMenuOpen] = useState(false);

  const onToggleTheme = useCallback(
    () => dispatch(toggleTheme()),
    [dispatch],
  );

  const onLogout = useCallback(
    () => dispatch(logout()),
    [dispatch],
  );

  function linkClass(href: string) {
    const active =
      href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-accent-dim text-accent'
        : 'text-content-dim hover:text-content hover:bg-surface-dim'
    }`;
  }

  return (
    <nav
      className="sticky top-0 z-50 bg-surface-raised border-b border-edge"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="font-bold text-lg text-accent tracking-tight"
          >
            InvestHub
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* User name */}
            {userName && (
              <span className="hidden sm:inline text-sm text-content-dim">
                {userName}
              </span>
            )}

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-content-dim hover:text-content hover:bg-surface-dim transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-content-dim hover:text-danger hover:bg-danger-dim transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-surface-dim"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-edge bg-surface-raised px-4 py-2 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block ${linkClass(href)}`}
            >
              {label}
            </Link>
          ))}
          {userName && (
            <div className="flex items-center justify-between px-3 py-2 text-sm text-content-dim">
              <span>{userName}</span>
              <button
                onClick={onLogout}
                className="text-danger text-xs font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
