'use client';

import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/src/store/hooks';
import { login } from '@/src/store/uiSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const name = email.split('@')[0].replace(/[^a-zA-Z ]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        dispatch(login(name));
        setLoading(false);
      }, 800);
    },
    [email, password, dispatch],
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-content tracking-tight">InvestHub</h1>
          <p className="text-content-dim text-sm mt-1">Investor & Corporate Dashboard</p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-edge bg-surface-raised p-8">
          <h2 className="text-xl font-semibold text-content mb-1">Welcome back</h2>
          <p className="text-sm text-content-dim mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-content-muted uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 text-sm rounded-xl border border-edge bg-surface-dim text-content placeholder:text-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-content-muted uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter any password"
                autoComplete="current-password"
                className="w-full px-4 py-3 text-sm rounded-xl border border-edge bg-surface-dim text-content placeholder:text-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-danger" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-edge">
            <p className="text-xs text-content-muted text-center">
              Demo mode — enter any email and password to continue
            </p>
          </div>
        </div>

        <p className="text-xs text-content-muted text-center mt-6">
          Built for Micro Integrated Semiconductor Systems Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
