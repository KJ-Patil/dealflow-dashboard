import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setErrorRate as setServiceErrorRate } from '@/src/services/delay';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  predicate: (action) =>
    typeof action.type === 'string' && action.type.startsWith('interests/'),
  effect: (_, api) => {
    const state = api.getState() as {
      interests: { savedDealIds: string[] };
    };
    try {
      localStorage.setItem(
        'interests',
        JSON.stringify(state.interests.savedDealIds),
      );
    } catch {
      // localStorage unavailable (SSR or quota exceeded)
    }
  },
});

listenerMiddleware.startListening({
  predicate: (action) =>
    typeof action.type === 'string' &&
    (action.type === 'ui/toggleTheme' || action.type === 'ui/hydrateTheme'),
  effect: (_, api) => {
    const state = api.getState() as { ui: { theme: string } };
    try {
      localStorage.setItem('theme', state.ui.theme);
      document.documentElement.classList.toggle(
        'dark',
        state.ui.theme === 'dark',
      );
    } catch {
      // SSR guard
    }
  },
});

listenerMiddleware.startListening({
  predicate: (action) =>
    typeof action.type === 'string' && action.type === 'ui/setErrorRate',
  effect: (_, api) => {
    const state = api.getState() as { ui: { errorRate: number } };
    setServiceErrorRate(state.ui.errorRate);
  },
});

export default listenerMiddleware;
