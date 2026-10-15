import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  errorRate: number;
}

const initialState: UiState = {
  theme: 'light',
  errorRate: 0.04,
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
  },
});

export const { hydrateTheme, toggleTheme, setErrorRate } = uiSlice.actions;
export default uiSlice.reducer;
