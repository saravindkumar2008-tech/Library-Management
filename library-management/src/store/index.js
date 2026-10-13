/**
 * Redux Toolkit Global Library Store
 * Requirement a: Create a global library store.
 * Requirement d: Use middleware to monitor library actions.
 * Requirement e: Synchronize state with browser storage.
 */

import { configureStore } from "@reduxjs/toolkit";
import libraryReducer from "./librarySlice.js";
import { libraryActionLogger } from "./middleware/libraryActionLogger.js";
import { storageSyncMiddleware } from "./middleware/storageSyncMiddleware.js";

export const store = configureStore({
  reducer: {
    library: libraryReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(libraryActionLogger, storageSyncMiddleware),
  devTools: process.env.NODE_ENV !== "production"
});

export default store;
