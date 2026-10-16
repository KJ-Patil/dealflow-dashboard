'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/src/store';
import { hydrateInterests } from '@/src/store/interestsSlice';
import { hydrateTheme, hydrateAuth } from '@/src/store/uiSlice';

function StoreHydration({ store }: { store: AppStore }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    try {
      const raw = localStorage.getItem('interests');
      if (raw) store.dispatch(hydrateInterests(JSON.parse(raw)));
    } catch {
      /* unavailable */
    }

    try {
      const t = localStorage.getItem('theme');
      if (t === 'light' || t === 'dark') store.dispatch(hydrateTheme(t));
    } catch {
      /* unavailable */
    }

    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.userName) store.dispatch(hydrateAuth(parsed));
      }
    } catch {
      /* unavailable */
    }
  }, [store]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <StoreHydration store={storeRef.current} />
      {children}
    </Provider>
  );
}
