import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface InterestsState {
  savedDealIds: string[];
}

const initialState: InterestsState = {
  savedDealIds: [],
};

const interestsSlice = createSlice({
  name: 'interests',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<string[]>) {
      state.savedDealIds = action.payload;
    },
    toggle(state, action: PayloadAction<string>) {
      const idx = state.savedDealIds.indexOf(action.payload);
      if (idx >= 0) {
        state.savedDealIds.splice(idx, 1);
      } else {
        state.savedDealIds.push(action.payload);
      }
    },
    remove(state, action: PayloadAction<string>) {
      state.savedDealIds = state.savedDealIds.filter(
        (id) => id !== action.payload,
      );
    },
    clear(state) {
      state.savedDealIds = [];
    },
  },
});

export const {
  hydrate: hydrateInterests,
  toggle: toggleInterest,
  remove: removeInterest,
  clear: clearInterests,
} = interestsSlice.actions;

export default interestsSlice.reducer;
