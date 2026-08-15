import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import promotionReducer from "./slices/promotionSlice";
import merchantReducer from "./slices/merchantSlice";
import menuReducer from "./slices/menuSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "ui"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  menu: menuReducer,
  promotion: promotionReducer,
  merchant: merchantReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredActionPaths: ["register", "rehydrate"],
        ignoredPaths: ["persist"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default for easier imports
export default store;

// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./slices/authSlice";
// import uiReducer from "./slices/uiSlice";
// import menuReducer from "./slices/menuSlice";
// import promotionReducer from "./slices/promotionSlice";
// // import authReducer from './slices/authSlice';
// import merchantReducer from "./slices/merchantSlice";
// // import menuReducer from './slices/menuSlice';
// // import promotionReducer from './slices/promotionSlice';

// export function makeStore() {
//   return configureStore({
//     reducer: {
//       auth: authReducer,
//       menu: menuReducer,
//       promotion: promotionReducer,
//       merchant: merchantReducer,
//       ui: uiReducer,
//     },
//   });
// }

// const store = makeStore();

// export default store;
