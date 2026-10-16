import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  errorRate: number;
  isLoggedIn: boolean;
  userName: string | null;
}

const initialState: UiState = {
  theme: 'light',
  errorRate: 0.04,
  isLoggedIn: false,
  userName: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    hydrateTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setErrorRate(state, action: PayloadAction<number>) {
      state.errorRate = Math.max(0, Math.min(1, action.payload));
    },
    login(state, action: PayloadAction<string>) {
      state.isLoggedIn = true;
      state.userName = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userName = null;
    },
    hydrateAuth(state, action: PayloadAction<{ userName: string }>) {
      state.isLoggedIn = true;
      state.userName = action.payload.userName;
    },
  },
});

export const { hydrateTheme, toggleTheme, setErrorRate, login, logout, hydrateAuth } = uiSlice.actions;
export default uiSlice.reducer;
