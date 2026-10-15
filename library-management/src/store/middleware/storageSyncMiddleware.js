/**
 * Redux Toolkit Middleware: storageSyncMiddleware
 * Requirement e: Synchronize state with browser storage.
 * Automatically saves critical slice state (borrowedBooks, readingHistory,
 * holdRequests, member profile, and books catalog) into localStorage whenever state updates.
 */

export const STORAGE_SYNC_KEY = "redux_library_store";
import { INITIAL_BOOKS } from "../../services/mockData.js";

export const storageSyncMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  // Synchronize on state changes
  if (typeof action.type === "string" && action.type.startsWith("library/")) {
    try {
      const state = storeAPI.getState().library;
      if (state) {
        const stateToPersist = {
          books: state.books,
          borrowedBooks: state.borrowedBooks,
          readingHistory: state.readingHistory,
          holdRequests: state.holdRequests,
          member: state.member,
          lastSyncedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(stateToPersist));

        // Also sync legacy keys so external components/localStorage readers remain compatible
        localStorage.setItem("library_books_catalog", JSON.stringify(state.books));
        localStorage.setItem("library_borrowed_books", JSON.stringify(state.borrowedBooks));
        localStorage.setItem("library_reading_history", JSON.stringify(state.readingHistory));
        localStorage.setItem("library_hold_requests", JSON.stringify(state.holdRequests));
        localStorage.setItem("library_member_profile", JSON.stringify(state.member));
      }
    } catch (err) {
      console.warn("[Redux storageSyncMiddleware] Failed to persist state to localStorage:", err);
    }
  }

  return result;
};

/**
 * Helper to load persisted state from localStorage on store initialization
 */
export function loadPersistedState() {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_SYNC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.books)) {
        parsed.books = parsed.books.map((b) => {
          const initial = INITIAL_BOOKS.find((init) => init.id === b.id || init.title === b.title);
          if (initial) {
            return { ...b, coverImage: initial.coverImage };
          }
          return b;
        });

        INITIAL_BOOKS.forEach((initBook) => {
          if (!parsed.books.some((b) => b.id === initBook.id || b.title === initBook.title)) {
            parsed.books.push(initBook);
          }
        });
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Could not read persisted Redux state:", err);
  }
  return undefined;
}
