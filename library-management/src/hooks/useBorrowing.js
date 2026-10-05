import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEYS = {
  BORROWED: "library_borrowed_books",
  HISTORY: "library_reading_history",
  HOLDS: "library_hold_requests"
};

const MAX_RENEWALS = 2; // Maximum renewals permitted per book

/**
 * Helper to calculate formatted date strings
 */
const formatDate = (date) => date.toISOString().split("T")[0];

const addDays = (days, baseDate = new Date()) => {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return formatDate(result);
};

/**
 * Custom Hook: useBorrowing
 * Manages borrowed books, due dates, renewal requests, hold requests, and borrowing status.
 * Synchronizes with browser localStorage via useEffect.
 */
export function useBorrowing(books, updateBookAvailability, member) {
  // 1. Initial State from localStorage
  const [borrowedBooks, setBorrowedBooks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BORROWED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [readingHistory, setReadingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [holdRequests, setHoldRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOLDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [operationFeedback, setOperationFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setOperationFeedback({ type, message });
    setTimeout(() => {
      setOperationFeedback(null);
    }, 4000);
  };

  // 2. useEffect: Synchronize borrowing information with browser storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BORROWED, JSON.stringify(borrowedBooks));
    } catch (err) {
      console.error("Failed to save borrowed books to localStorage", err);
    }
  }, [borrowedBooks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(readingHistory));
    } catch (err) {
      console.error("Failed to save reading history to localStorage", err);
    }
  }, [readingHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOLDS, JSON.stringify(holdRequests));
    } catch (err) {
      console.error("Failed to save hold requests to localStorage", err);
    }
  }, [holdRequests]);

  // 3. useMemo Calculations (Requirement e)
  
  // Available books
  const availableBooks = useMemo(() => {
    return books.filter((b) => b.available);
  }, [books]);

  // Borrowed books list (memoized)
  const memoizedBorrowedBooks = useMemo(() => {
    return borrowedBooks;
  }, [borrowedBooks]);

  // Overdue books (dueDate is strictly before today)
  const overdueBooks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return borrowedBooks.filter((book) => {
      const due = new Date(book.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [borrowedBooks]);

  // Due-soon books (due within next 3 days and not overdue)
  const dueSoonBooks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysOut = new Date(today);
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);

    return borrowedBooks.filter((book) => {
      const due = new Date(book.dueDate);
      due.setHours(0, 0, 0, 0);
      return due >= today && due <= threeDaysOut;
    });
  }, [borrowedBooks]);

  // Reading statistics
  const readingStatistics = useMemo(() => {
    const totalBorrowedCount = borrowedBooks.length;
    const totalHistoryCount = readingHistory.length;
    const totalHoldCount = holdRequests.length;
    const totalOverdue = overdueBooks.length;
    const totalDueSoon = dueSoonBooks.length;

    // Category breakdown
    const categoryCounts = {};
    [...readingHistory, ...borrowedBooks].forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    let topCategory = "None";
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    return {
      totalCatalogBooks: books.length,
      availableCount: availableBooks.length,
      borrowedCount: totalBorrowedCount,
      overdueCount: totalOverdue,
      dueSoonCount: totalDueSoon,
      completedCount: totalHistoryCount,
      holdsCount: totalHoldCount,
      topCategory,
      totalActivity: totalBorrowedCount + totalHistoryCount
    };
  }, [books, availableBooks, borrowedBooks, overdueBooks, dueSoonBooks, readingHistory, holdRequests]);

  // 4. useCallback for library operations (Requirement f)

  // borrowBook()
  const borrowBook = useCallback((book) => {
    if (!book || !book.available) {
      showFeedback("error", "Book currently unavailable for checkout.");
      return false;
    }

    const dueDate = addDays(14); // 14-day loan period
    const borrowedDate = formatDate(new Date());

    const newBorrowItem = {
      ...book,
      borrowedDate,
      dueDate,
      renewalCount: 0,
      maxRenewals: MAX_RENEWALS,
      status: "Borrowed"
    };

    setBorrowedBooks((prev) => [...prev, newBorrowItem]);
    updateBookAvailability(book.id, false);

    // If there was a hold by this member, clear it
    setHoldRequests((prev) => prev.filter((h) => h.bookId !== book.id));

    showFeedback("success", `"${book.title}" checked out successfully! Due date: ${dueDate}`);
    return true;
  }, [updateBookAvailability]);

  // returnBook()
  const returnBook = useCallback((bookId) => {
    const itemToReturn = borrowedBooks.find((b) => b.id === bookId);
    if (!itemToReturn) {
      showFeedback("error", "Book not found in borrowed list.");
      return false;
    }

    const returnedDate = formatDate(new Date());
    const historyItem = {
      ...itemToReturn,
      returnedDate,
      status: "Returned"
    };

    setReadingHistory((prev) => [historyItem, ...prev]);
    setBorrowedBooks((prev) => prev.filter((b) => b.id !== bookId));
    updateBookAvailability(bookId, true);

    showFeedback("success", `"${itemToReturn.title}" returned successfully and added to reading history!`);
    return true;
  }, [borrowedBooks, updateBookAvailability]);

  // renewBook()
  const renewBook = useCallback((bookId) => {
    const book = borrowedBooks.find((b) => b.id === bookId);
    if (!book) {
      showFeedback("error", "Book not found.");
      return false;
    }

    // Check if renewal is not available (max renewals reached or held by another user)
    const currentRenewals = book.renewalCount || 0;
    if (currentRenewals >= (book.maxRenewals || MAX_RENEWALS)) {
      showFeedback("error", `Book renewal is not available for "${book.title}". Maximum renewals reached (${MAX_RENEWALS}/${MAX_RENEWALS}).`);
      return false;
    }

    const currentDue = new Date(book.dueDate);
    const newDueDate = addDays(7, currentDue);

    setBorrowedBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            dueDate: newDueDate,
            renewalCount: currentRenewals + 1
          };
        }
        return b;
      })
    );

    showFeedback("success", `"${book.title}" renewed for +7 days! New due date: ${newDueDate} (Renewal ${currentRenewals + 1}/${MAX_RENEWALS})`);
    return true;
  }, [borrowedBooks]);

  // placeHold()
  const placeHold = useCallback((book) => {
    if (!book) return false;

    // Check if hold already exists for this book
    const existingHold = holdRequests.find((h) => h.bookId === book.id);
    if (existingHold) {
      showFeedback("info", `You already have an active hold on "${book.title}".`);
      return false;
    }

    const newHold = {
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      year: book.year,
      holdDate: formatDate(new Date()),
      memberName: member?.name || "Library Member",
      memberId: member?.memberId || "MEMBER-01",
      status: "Waiting for return"
    };

    setHoldRequests((prev) => [...prev, newHold]);
    showFeedback("success", `Hold placed successfully for "${book.title}". You will be notified when it is returned.`);
    return true;
  }, [holdRequests, member]);

  // clearBorrowing()
  const clearBorrowing = useCallback(() => {
    if (borrowedBooks.length === 0) {
      showFeedback("info", "No active borrowings to clear.");
      return;
    }

    // Move all to history
    const returnedDate = formatDate(new Date());
    const clearedHistoryItems = borrowedBooks.map((b) => ({
      ...b,
      returnedDate,
      status: "Returned"
    }));

    // Mark all books available
    borrowedBooks.forEach((b) => {
      updateBookAvailability(b.id, true);
    });

    setReadingHistory((prev) => [...clearedHistoryItems, ...prev]);
    setBorrowedBooks([]);

    showFeedback("success", "All active borrowings have been cleared and returned!");
  }, [borrowedBooks, updateBookAvailability]);

  // Cancel a hold request
  const cancelHold = useCallback((holdId) => {
    setHoldRequests((prev) => prev.filter((h) => h.id !== holdId));
    showFeedback("info", "Hold request cancelled.");
  }, []);

  return {
    borrowedBooks: memoizedBorrowedBooks,
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
  };
}
