/**
 * testUtils.jsx
 * Shared render helper with Redux + Router providers for all tests.
 */
import React from "react";
import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import libraryReducer from "../store/librarySlice";
import { INITIAL_BOOKS, DEFAULT_MEMBER_DATA } from "../services/mockData";

// ---------------------------------------------------------------------------
// Default preloaded state
// ---------------------------------------------------------------------------
export const makeDefaultState = (overrides = {}) => ({
  library: {
    books: INITIAL_BOOKS,
    borrowedBooks: [],
    readingHistory: [],
    holdRequests: [],
    member: DEFAULT_MEMBER_DATA,
    filters: { search: "", category: "All", author: "All", availability: "All" },
    loading: false,
    error: null,
    operationFeedback: null,
    lastSyncedAt: new Date().toISOString(),
    ...overrides
  }
});

// ---------------------------------------------------------------------------
// Custom render — wraps with Redux Provider + MemoryRouter
// ---------------------------------------------------------------------------
export function renderWithProviders(
  ui,
  {
    preloadedState = makeDefaultState(),
    route = "/",
    store = configureStore({
      reducer: { library: libraryReducer },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// ---------------------------------------------------------------------------
// Shared mock book objects used across tests
// ---------------------------------------------------------------------------
export const mockAvailableBook = {
  id: 101,
  title: "Ponniyin Selvan",
  author: "Kalki Krishnamurthy",
  category: "Historical Fiction",
  year: 1955,
  available: true,
  rating: 4.9,
  isbn: "978-8184680010",
  pages: 2400,
  language: "Tamil",
  description: "A monumental 5-volume historical fiction classic."
};

export const mockUnavailableBook = {
  id: 102,
  title: "Sivagamiyin Sabatham",
  author: "Kalki Krishnamurthy",
  category: "Historical Fiction",
  year: 1948,
  available: false,
  rating: 4.8,
  isbn: "978-8184680027",
  pages: 1120,
  language: "Tamil",
  description: "Set during Pallava-Chalukya conflicts."
};

export const mockBorrowedEntry = {
  ...mockAvailableBook,
  available: false,
  borrowDate: "2026-10-01",
  dueDate: "2026-10-15",
  renewalCount: 0,
  maxRenewals: 2,
  notes: "Standard loan",
  status: "borrowed"
};

export const mockMember = {
  ...DEFAULT_MEMBER_DATA,
  activeLoansCount: 0
};
