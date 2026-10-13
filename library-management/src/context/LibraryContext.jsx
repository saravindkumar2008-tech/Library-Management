import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useBooks } from "../hooks/useBooks";
import { useBorrowing } from "../hooks/useBorrowing";
import { memberService } from "../services/memberService";
import { apiConfig } from "../services/apiConfig";

// 1. Create the LibraryContext
export const LibraryContext = createContext(null);

const DEFAULT_MEMBER = {
  name: "Aravind Kumar",
  email: "aravind.kumar@gmail.com",
  memberId: "AK-LIB-101",
  phone: "+91 98765 43210",
  branch: "AK Central Library, Chennai",
  membershipTier: "Gold Scholar",
  joinedDate: "2024-01-15",
  maxBooksAllowed: 5
};

/**
 * LibraryProvider Component
 * Integrates REST API data fetching for Books and Members,
 * useBorrowing hook, and global API control states.
 */
export function LibraryProvider({ children }) {
  // Member Profile State with REST API integration (Requirement a)
  const [member, setMemberState] = useState(DEFAULT_MEMBER);
  const [memberLoading, setMemberLoading] = useState(true);
  const [memberError, setMemberError] = useState(null);

  // API Configuration State
  const [apiEngine, setApiEngineState] = useState(apiConfig.clientType);
  const [simulatedDelay, setSimulatedDelayState] = useState(apiConfig.simulatedDelay);
  const [simulateError, setSimulateErrorState] = useState(apiConfig.simulateError);

  // Sync API config state
  useEffect(() => {
    return apiConfig.subscribe((cfg) => {
      setApiEngineState(cfg.clientType);
      setSimulatedDelayState(cfg.simulatedDelay);
      setSimulateErrorState(cfg.simulateError);
    });
  }, []);

  const setApiEngine = (engine) => {
    apiConfig.setClientType(engine);
  };

  const setSimulatedDelay = (ms) => {
    apiConfig.setSimulatedDelay(ms);
  };

  const setSimulateError = (err) => {
    apiConfig.setSimulateError(err);
  };

  // Requirement a: Fetch member information using REST APIs
  const fetchMemberInfo = useCallback(async () => {
    setMemberLoading(true);
    setMemberError(null);
    try {
      const data = await memberService.fetchCurrentMember();
      setMemberState(data);
    } catch (err) {
      console.error("Error fetching member from REST API:", err);
      setMemberError(err.message || "Failed to load member profile via REST API.");
    } finally {
      setMemberLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberInfo();
  }, [fetchMemberInfo]);

  const setMember = (updater) => {
    setMemberState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      memberService.updateMemberProfile(next.memberId || "AK-LIB-101", next).catch((err) => {
        console.warn("Async member update error:", err);
      });
      return next;
    });
  };

  // 1. useBooks custom hook (REST API driven)
  const {
    books,
    filteredBooks,
    loading: booksLoading,
    error: booksError,
    search,
    setSearch,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    currentEngine,
    updateBookAvailability,
    resetFilters,
    refetchBooks
  } = useBooks();

  // 2. useBorrowing custom hook
  const {
    borrowedBooks,
    readingHistory,
    holdRequests,
    availableBooks,
    overdueBooks,
    dueSoonBooks,
    readingStatistics,
    borrowBook,
    returnBook,
    renewBook,
    placeHold,
    cancelHold,
    clearBorrowing,
    operationFeedback
  } = useBorrowing(books, updateBookAvailability, member);

  // Detail Modal management
  const [selectedBook, setSelectedBook] = useState(null);
  const openBookDetail = (book) => setSelectedBook(book);
  const closeBookDetail = () => setSelectedBook(null);

  // Shared context value object
  const value = {
    // Book catalog & search/filter state (REST API)
    books,
    filteredBooks,
    booksLoading,
    booksError,
    refetchBooks,
    search,
    setSearch,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    updateBookAvailability,
    resetFilters,

    // Borrowing & stats state
    borrowedBooks,
    readingHistory,
    holdRequests,
    availableBooks,
    overdueBooks,
    dueSoonBooks,
    readingStatistics,

    // Operations
    borrowBook,
    returnBook,
    renewBook,
    placeHold,
    cancelHold,
    clearBorrowing,
    operationFeedback,

    // Member information via REST API
    member,
    setMember,
    memberLoading,
    memberError,
    refetchMember: fetchMemberInfo,

    // API Engine & Simulation Controls
    apiEngine,
    setApiEngine,
    simulatedDelay,
    setSimulatedDelay,
    simulateError,
    setSimulateError,
    currentEngine,

    // Detail Modal management
    selectedBook,
    openBookDetail,
    closeBookDetail
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
