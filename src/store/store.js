import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
// import authReducer from './slices/authSlice';
// import merchantReducer from './slices/merchantSlice';
// import menuReducer from './slices/menuSlice';
// import promotionReducer from './slices/promotionSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
  });
}

const store = makeStore();

export default store;
