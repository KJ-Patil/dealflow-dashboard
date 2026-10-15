import { configureStore } from '@reduxjs/toolkit';
import dealsReducer from './dealsSlice';
import dealDetailsReducer from './dealDetailsSlice';
import investorReducer from './investorSlice';
import corporateReducer from './corporateSlice';
import interestsReducer from './interestsSlice';
import uiReducer from './uiSlice';
import listenerMiddleware from './listenerMiddleware';

export const makeStore = () =>
  configureStore({
    reducer: {
      deals: dealsReducer,
      dealDetails: dealDetailsReducer,
      investor: investorReducer,
      corporate: corporateReducer,
      interests: interestsReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
