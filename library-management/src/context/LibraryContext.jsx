import React, { createContext, useContext, useState, useEffect } from "react";
import { useBooks } from "../hooks/useBooks";
import { useBorrowing } from "../hooks/useBorrowing";

// 1. Create the LibraryContext
export const LibraryContext = createContext(null);

const DEFAULT_MEMBER = {
  name: "Aravind Kumar",
  email: "aravind.kumar@gmail.com",
  memberId: "AK-LIB-101",
  phone: "+91 98765 43210",
  branch: "AK Central Library, Chennai",
  membershipTier: "Gold Scholar",
  joinedDate: "2024-01-15"
};

/**
 * LibraryProvider Component
 * Integrates useBooks and useBorrowing hooks, member profile state,
 * and shares state seamlessly to child components without prop drilling.
 */
export function LibraryProvider({ children }) {
  // Member Profile State with localStorage persistence
  const [member, setMemberState] = useState(DEFAULT_MEMBER);

  // Requirement c: Use useEffect to load member information when application starts
  useEffect(() => {
    try {
      const saved = localStorage.getItem("library_member_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === "Arun Kumar" || parsed.name === "Arun") {
          parsed.name = "Aravind Kumar";
          parsed.email = "aravind.kumar@gmail.com";
          localStorage.setItem("library_member_profile", JSON.stringify(parsed));
        }
        setMemberState(parsed);
      } else {
        setMemberState(DEFAULT_MEMBER);
      }
    } catch {
      setMemberState(DEFAULT_MEMBER);
    }
  }, []);

  const setMember = (updater) => {
    setMemberState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("library_member_profile", JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save member profile", err);
      }
      return next;
    });
  };

  // 1. useBooks custom hook
  const {
    books,
    setBooks,
    search,
    setSearch,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    filteredBooks,
    updateBookAvailability,
    resetFilters
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

  // Selected book for BookDetail modal
  const [selectedBook, setSelectedBook] = useState(null);

  const openBookDetail = (book) => {
    setSelectedBook(book);
  };

  const closeBookDetail = () => {
    setSelectedBook(null);
  };

  // Shared context value object
  const value = {
    // Book catalog & search/filter state (from useBooks)
    books,
    setBooks,
    search,
    setSearch,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    filteredBooks,
    updateBookAvailability,
    resetFilters,

    // Borrowing & stats state (from useBorrowing)
    borrowedBooks,
    readingHistory,
    holdRequests,
    availableBooks,
    overdueBooks,
    dueSoonBooks,
    readingStatistics,

    // Operations (useCallback)
    borrowBook,
    returnBook,
    renewBook,
    placeHold,
    cancelHold,
    clearBorrowing,
    operationFeedback,

    // Member information
    member,
    setMember,

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
 * Provides direct access to LibraryContext without manual useContext calls.
 */
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
