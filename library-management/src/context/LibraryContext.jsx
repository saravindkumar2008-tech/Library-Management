import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  borrowBook as reduxBorrowBook,
  returnBook as reduxReturnBook,
  renewBook as reduxRenewBook,
  placeHold as reduxPlaceHold,
  cancelHold as reduxCancelHold,
  updateBookAvailability as reduxUpdateBookAvailability,
  setSearch as reduxSetSearch,
  setCategory as reduxSetCategory,
  setAuthor as reduxSetAuthor,
  setAvailability as reduxSetAvailability,
  resetFilters as reduxResetFilters,
  setMember as reduxSetMember,
  clearOperationFeedback as reduxClearFeedback,
  resetStore as reduxResetStore
} from "../store/librarySlice";
import { apiConfig } from "../services/apiConfig";

// 1. Create the LibraryContext
export const LibraryContext = createContext(null);

/**
 * LibraryProvider Component
 * Connected directly to Redux Toolkit Global Store.
 * Bridges Redux Toolkit state, actions, and middlewares to application components.
 * Satisfies Experiment 2 Requirements a, b, c, d, e, f.
 */
export function LibraryProvider({ children }) {
  const dispatch = useDispatch();

  // Read state from Redux Toolkit Store (Requirement a & b)
  const {
    books,
    borrowedBooks,
    readingHistory,
    holdRequests,
    member,
    filters,
    operationFeedback,
    loading: storeLoading,
    error: storeError,
    lastSyncedAt
  } = useSelector((state) => state.library);

  // Auto-dismiss toast feedback
  useEffect(() => {
    if (operationFeedback) {
      const timer = setTimeout(() => {
        dispatch(reduxClearFeedback());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [operationFeedback, dispatch]);

  // API Config state for Experiment 1 & 2 integration
  const [apiEngine, setApiEngineState] = useState(apiConfig.clientType);
  const [simulatedDelay, setSimulatedDelayState] = useState(apiConfig.simulatedDelay);
  const [simulateError, setSimulateErrorState] = useState(apiConfig.simulateError);

  useEffect(() => {
    return apiConfig.subscribe((cfg) => {
      setApiEngineState(cfg.clientType);
      setSimulatedDelayState(cfg.simulatedDelay);
      setSimulateErrorState(cfg.simulateError);
    });
  }, []);

  const setApiEngine = (engine) => apiConfig.setClientType(engine);
  const setSimulatedDelay = (ms) => apiConfig.setSimulatedDelay(ms);
  const setSimulateError = (err) => apiConfig.setSimulateError(err);

  // Filtered books calculated from Redux state and filters
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const q = (filters.search || "").trim().toLowerCase();
      const matchSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.description && book.description.toLowerCase().includes(q));

      const matchCat =
        !filters.category ||
        filters.category === "All" ||
        book.category.toLowerCase() === filters.category.toLowerCase();

      const matchAuth =
        !filters.author ||
        filters.author === "All" ||
        book.author.toLowerCase() === filters.author.toLowerCase();

      let matchAvail = true;
      if (filters.availability === "Available") matchAvail = book.available === true;
      if (filters.availability === "Unavailable") matchAvail = book.available === false;

      return matchSearch && matchCat && matchAuth && matchAvail;
    });
  }, [books, filters]);

  // Derived loan metrics (memoized)
  const availableBooks = useMemo(() => books.filter((b) => b.available), [books]);

  const todayStr = new Date().toISOString().split("T")[0];
  const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  const overdueBooks = useMemo(
    () => borrowedBooks.filter((b) => b.dueDate && b.dueDate < todayStr),
    [borrowedBooks, todayStr]
  );

  const dueSoonBooks = useMemo(
    () =>
      borrowedBooks.filter(
        (b) => b.dueDate && b.dueDate >= todayStr && b.dueDate <= threeDaysAhead
      ),
    [borrowedBooks, todayStr, threeDaysAhead]
  );

  const readingStatistics = useMemo(() => {
    const totalBorrowed = borrowedBooks.length + readingHistory.length;
    const completedCount = readingHistory.length;
    const categoryCounts = {};
    readingHistory.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    let topCategory = "General";
    let max = 0;
    Object.entries(categoryCounts).forEach(([cat, cnt]) => {
      if (cnt > max) {
        max = cnt;
        topCategory = cat;
      }
    });

    return { totalBorrowed, completedCount, topCategory };
  }, [borrowedBooks, readingHistory]);

  // Requirement c: Redux Actions Dispatched through Middleware
  const borrowBook = useCallback(
    (bookId, durationDays = 14, notes = "") => {
      dispatch(reduxBorrowBook({ bookId, durationDays, notes }));
    },
    [dispatch]
  );

  const returnBook = useCallback(
    (bookId, rating = 5, notes = "") => {
      dispatch(reduxReturnBook({ bookId, rating, notes }));
    },
    [dispatch]
  );

  const renewBook = useCallback(
    (bookId, extensionDays = 7, reason = "") => {
      dispatch(reduxRenewBook({ bookId, extensionDays, reason }));
    },
    [dispatch]
  );

  const placeHold = useCallback(
    (bookId, notes = "") => {
      dispatch(reduxPlaceHold({ bookId, notes }));
    },
    [dispatch]
  );

  const cancelHold = useCallback(
    (bookId) => {
      dispatch(reduxCancelHold(bookId));
    },
    [dispatch]
  );

  const updateBookAvailability = useCallback(
    (id, available) => {
      dispatch(reduxUpdateBookAvailability({ id, available }));
    },
    [dispatch]
  );

  // Search & Filter Actions
  const setSearch = useCallback((val) => dispatch(reduxSetSearch(val)), [dispatch]);
  const setCategory = useCallback((val) => dispatch(reduxSetCategory(val)), [dispatch]);
  const setAuthor = useCallback((val) => dispatch(reduxSetAuthor(val)), [dispatch]);
  const setAvailability = useCallback((val) => dispatch(reduxSetAvailability(val)), [dispatch]);
  const resetFilters = useCallback(() => dispatch(reduxResetFilters()), [dispatch]);

  const setMember = useCallback(
    (updater) => {
      if (typeof updater === "function") {
        const next = updater(member);
        dispatch(reduxSetMember(next));
      } else {
        dispatch(reduxSetMember(updater));
      }
    },
    [dispatch, member]
  );

  const resetStore = useCallback(() => dispatch(reduxResetStore()), [dispatch]);

  // Selected book for Detail Modal
  const [selectedBook, setSelectedBook] = useState(null);
  const openBookDetail = (book) => setSelectedBook(book);
  const closeBookDetail = () => setSelectedBook(null);

  const value = {
    // Redux Books State & Filters
    books,
    filteredBooks,
    booksLoading: storeLoading,
    booksError: storeError,
    search: filters.search,
    setSearch,
    author: filters.author,
    setAuthor,
    category: filters.category,
    setCategory,
    availability: filters.availability,
    setAvailability,
    updateBookAvailability,
    resetFilters,
    refetchBooks: () => {},

    // Redux Borrowing & Reading History State
    borrowedBooks,
    readingHistory,
    holdRequests,
    availableBooks,
    overdueBooks,
    dueSoonBooks,
    readingStatistics,

    // Redux Actions (Requirement c)
    borrowBook,
    returnBook,
    renewBook,
    placeHold,
    cancelHold,
    clearBorrowing: resetStore,
    operationFeedback,
    resetStore,

    // Member Information
    member,
    setMember,
    memberLoading: false,
    memberError: null,
    refetchMember: () => {},

    // API Engine & Simulation
    apiEngine,
    setApiEngine,
    simulatedDelay,
    setSimulatedDelay,
    simulateError,
    setSimulateError,
    currentEngine: apiEngine,

    // Modal
    selectedBook,
    openBookDetail,
    closeBookDetail,

    // Storage Sync Metadata
    lastSyncedAt
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

/**
 * Custom Hook: useLibrary
 */
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
