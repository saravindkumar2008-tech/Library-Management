/**
 * Redux Toolkit Library Slice
 * Requirements a, b, c:
 * - Manages global state for books, borrowed books, member info, and reading history
 * - Implements borrow, return, renew, and hold actions with validation
 */

import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_BOOKS, DEFAULT_MEMBER_DATA } from "../services/mockData.js";
import { loadPersistedState } from "./middleware/storageSyncMiddleware.js";

// Helpers for date calculations
const formatDate = (d) => d.toISOString().split("T")[0];
const addDays = (days, base = new Date()) => {
  const target = new Date(base);
  target.setDate(target.getDate() + days);
  return formatDate(target);
};

// Check for persisted state or fallback to defaults
const persisted = loadPersistedState();

const initialState = {
  // Requirement b: Books collection
  books: persisted?.books || INITIAL_BOOKS,

  // Requirement b: Borrowed books list
  borrowedBooks: persisted?.borrowedBooks || [],

  // Requirement b: Member profile information
  member: persisted?.member || DEFAULT_MEMBER_DATA,

  // Requirement b: Reading history of completed books
  readingHistory: persisted?.readingHistory || [],

  // Active reservation holds
  holdRequests: persisted?.holdRequests || [],

  // Search & filter criteria
  filters: {
    search: "",
    category: "All",
    author: "All",
    availability: "All"
  },

  // Requirement f: Loading and error states
  loading: false,
  error: null,

  // User feedback toast notifications
  operationFeedback: null,

  // Last synced timestamp
  lastSyncedAt: persisted?.lastSyncedAt || new Date().toISOString()
};

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    /**
     * Requirement c: Implement borrow action
     * Marks book unavailable, adds to borrowedBooks, tracks due date (14 days), updates member loans count.
     */
    borrowBook: (state, action) => {
      const { bookId, durationDays = 14, notes = "" } = action.payload || {};
      const numericId = Number(bookId);
      const bookIndex = state.books.findIndex(
        (b) => b.id === numericId || String(b.id) === String(bookId)
      );

      if (bookIndex === -1) {
        state.operationFeedback = {
          type: "error",
          message: `Book #${bookId} not found in library catalog.`
        };
        return;
      }

      const book = state.books[bookIndex];

      // Check if already borrowed
      const alreadyBorrowed = state.borrowedBooks.some((b) => String(b.id) === String(book.id));
      if (alreadyBorrowed || !book.available) {
        state.operationFeedback = {
          type: "error",
          message: `"${book.title}" is currently checked out and unavailable.`
        };
        return;
      }

      // Check member maximum loan limit
      const maxAllowed = state.member.maxBooksAllowed || 5;
      if (state.borrowedBooks.length >= maxAllowed) {
        state.operationFeedback = {
          type: "error",
          message: `Borrow limit reached (${maxAllowed} books). Please return a book before borrowing more.`
        };
        return;
      }

      const todayStr = formatDate(new Date());
      const dueStr = addDays(durationDays, new Date());

      // Mark book unavailable in catalog
      state.books[bookIndex].available = false;

      // Add record to borrowedBooks
      const borrowEntry = {
        ...book,
        available: false,
        borrowDate: todayStr,
        dueDate: dueStr,
        renewalCount: 0,
        maxRenewals: 2,
        notes: notes || "Standard 14-day circulating loan",
        status: "borrowed"
      };
      state.borrowedBooks.push(borrowEntry);

      // Remove from active holds if member had this book on hold
      state.holdRequests = state.holdRequests.filter((h) => String(h.bookId) !== String(book.id));

      // Update member active count
      state.member.activeLoansCount = state.borrowedBooks.length;

      // Set user feedback toast
      state.operationFeedback = {
        type: "success",
        message: `Successfully borrowed "${book.title}". Due date is ${dueStr}.`
      };
    },

    /**
     * Requirement c: Implement return action
     * Removes from borrowedBooks, marks book available, records completion in readingHistory.
     */
    returnBook: (state, action) => {
      const { bookId, rating = 5, notes = "" } =
        typeof action.payload === "object" ? action.payload : { bookId: action.payload };

      const borrowIndex = state.borrowedBooks.findIndex(
        (b) => String(b.id) === String(bookId)
      );

      if (borrowIndex === -1) {
        state.operationFeedback = {
          type: "error",
          message: `Book #${bookId} is not in your currently borrowed list.`
        };
        return;
      }

      const returnedItem = state.borrowedBooks[borrowIndex];

      // Remove from borrowed list
      state.borrowedBooks.splice(borrowIndex, 1);

      // Mark book available in catalog
      const catIndex = state.books.findIndex((b) => String(b.id) === String(bookId));
      if (catIndex !== -1) {
        state.books[catIndex].available = true;
      }

      // Calculate days kept
      const bDate = new Date(returnedItem.borrowDate || new Date());
      const rDate = new Date();
      const daysKept = Math.max(1, Math.round((rDate - bDate) / (1000 * 60 * 60 * 24)));

      // Add to reading history
      state.readingHistory.unshift({
        id: returnedItem.id,
        title: returnedItem.title,
        author: returnedItem.author,
        category: returnedItem.category,
        year: returnedItem.year,
        borrowDate: returnedItem.borrowDate,
        returnDate: formatDate(rDate),
        daysKept,
        rating: Number(rating) || 5,
        notes: notes || "Completed and returned to circulation"
      });

      // Update member active loan count
      state.member.activeLoansCount = state.borrowedBooks.length;

      state.operationFeedback = {
        type: "success",
        message: `Returned "${returnedItem.title}". Added to reading history!`
      };
    },

    /**
     * Requirement c: Implement renew action
     * Extends due date by +7 days, enforces max renewals check (up to 2).
     */
    renewBook: (state, action) => {
      const { bookId, extensionDays = 7, reason = "" } =
        typeof action.payload === "object" ? action.payload : { bookId: action.payload };

      const borrowIndex = state.borrowedBooks.findIndex(
        (b) => String(b.id) === String(bookId)
      );

      if (borrowIndex === -1) {
        state.operationFeedback = {
          type: "error",
          message: `Cannot renew: Book #${bookId} is not currently borrowed.`
        };
        return;
      }

      const item = state.borrowedBooks[borrowIndex];
      const renewalsUsed = item.renewalCount || 0;
      const maxRenewals = item.maxRenewals || 2;

      if (renewalsUsed >= maxRenewals) {
        state.operationFeedback = {
          type: "error",
          message: `Maximum renewals reached (${maxRenewals}) for "${item.title}". Please return the book.`
        };
        return;
      }

      // Extend due date from existing due date
      const currentDueDate = new Date(item.dueDate || new Date());
      const newDueDate = addDays(extensionDays, currentDueDate);

      state.borrowedBooks[borrowIndex].dueDate = newDueDate;
      state.borrowedBooks[borrowIndex].renewalCount = renewalsUsed + 1;
      if (reason) {
        state.borrowedBooks[borrowIndex].notes = `Renewed: ${reason}`;
      }

      state.operationFeedback = {
        type: "success",
        message: `Renewed "${item.title}" for +${extensionDays} days. New due date is ${newDueDate}. (Renewals used: ${renewalsUsed + 1}/${maxRenewals})`
      };
    },

    /**
     * Requirement c: Implement hold action
     * Records book reservation when unavailable.
     */
    placeHold: (state, action) => {
      const { bookId, notes = "" } =
        typeof action.payload === "object" ? action.payload : { bookId: action.payload };

      const book = state.books.find((b) => String(b.id) === String(bookId));
      if (!book) {
        state.operationFeedback = {
          type: "error",
          message: `Book #${bookId} not found.`
        };
        return;
      }

      const alreadyHold = state.holdRequests.some((h) => String(h.bookId) === String(book.id));
      if (alreadyHold) {
        state.operationFeedback = {
          type: "info",
          message: `You already have an active hold on "${book.title}".`
        };
        return;
      }

      const holdEntry = {
        id: "HOLD-" + Date.now().toString(36).toUpperCase(),
        bookId: book.id,
        bookTitle: book.title,
        author: book.author,
        category: book.category,
        holdDate: formatDate(new Date()),
        memberId: state.member.memberId || "AK-LIB-101",
        status: "Queue Position #1",
        notes: notes || "Priority reservation hold"
      };

      state.holdRequests.push(holdEntry);

      state.operationFeedback = {
        type: "success",
        message: `Hold placed for "${book.title}". We'll notify you when it becomes available.`
      };
    },

    cancelHold: (state, action) => {
      const bookId = typeof action.payload === "object" ? action.payload.bookId : action.payload;
      state.holdRequests = state.holdRequests.filter(
        (h) => String(h.bookId) !== String(bookId) && String(h.id) !== String(bookId)
      );
      state.operationFeedback = {
        type: "info",
        message: "Reservation hold cancelled."
      };
    },

    /**
     * Requirement b: Add a new book (POST CRUD)
     */
    addBook: (state, action) => {
      const newBook = action.payload;
      state.books.unshift(newBook);
      state.operationFeedback = {
        type: "success",
        message: `Book "${newBook.title}" successfully added to library catalog!`
      };
    },

    /**
     * Requirement c: Update book information (PUT/PATCH CRUD)
     */
    updateBookInfo: (state, action) => {
      const updated = action.payload;
      const index = state.books.findIndex((b) => String(b.id) === String(updated.id));
      if (index !== -1) {
        state.books[index] = { ...state.books[index], ...updated };
      }
      // Also update in borrowedBooks if currently borrowed
      const brwIndex = state.borrowedBooks.findIndex((b) => String(b.id) === String(updated.id));
      if (brwIndex !== -1) {
        state.borrowedBooks[brwIndex] = { ...state.borrowedBooks[brwIndex], ...updated };
      }
      state.operationFeedback = {
        type: "success",
        message: `Book "${updated.title}" successfully updated!`
      };
    },

    /**
     * Requirement d: Delete book (DELETE CRUD)
     */
    deleteBook: (state, action) => {
      const bookId = typeof action.payload === "object" ? action.payload.id : action.payload;
      const deletedBook = state.books.find((b) => String(b.id) === String(bookId));
      state.books = state.books.filter((b) => String(b.id) !== String(bookId));
      state.borrowedBooks = state.borrowedBooks.filter((b) => String(b.id) !== String(bookId));
      state.holdRequests = state.holdRequests.filter((h) => String(h.bookId) !== String(bookId));
      state.operationFeedback = {
        type: "info",
        message: `Book "${deletedBook?.title || bookId}" removed from library catalog.`
      };
    },

    /**
     * Update individual book status
     */
    updateBookAvailability: (state, action) => {
      const { id, available } = action.payload;
      const index = state.books.findIndex((b) => String(b.id) === String(id));
      if (index !== -1) {
        state.books[index].available = available;
      }
    },

    /**
     * Search and Filter Reducers
     */
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    setAuthor: (state, action) => {
      state.filters.author = action.payload;
    },
    setAvailability: (state, action) => {
      state.filters.availability = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: "",
        category: "All",
        author: "All",
        availability: "All"
      };
    },

    /**
     * Member updates
     */
    setMember: (state, action) => {
      state.member = { ...state.member, ...action.payload };
    },

    /**
     * Requirement f: Loading & Error state management
     */
    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setOperationFeedback: (state, action) => {
      state.operationFeedback = action.payload;
    },
    clearOperationFeedback: (state) => {
      state.operationFeedback = null;
    },

    /**
     * Reset store to default seed state
     */
    resetStore: (state) => {
      state.books = INITIAL_BOOKS;
      state.borrowedBooks = [];
      state.readingHistory = [];
      state.holdRequests = [];
      state.member = DEFAULT_MEMBER_DATA;
      state.filters = {
        search: "",
        category: "All",
        author: "All",
        availability: "All"
      };
      state.operationFeedback = {
        type: "info",
        message: "Library Redux store reset to initial catalog."
      };
    }
  }
});

export const {
  borrowBook,
  returnBook,
  renewBook,
  placeHold,
  cancelHold,
  addBook,
  updateBookInfo,
  deleteBook,
  updateBookAvailability,
  setSearch,
  setCategory,
  setAuthor,
  setAvailability,
  resetFilters,
  setMember,
  setLoading,
  setError,
  setOperationFeedback,
  clearOperationFeedback,
  resetStore
} = librarySlice.actions;

export default librarySlice.reducer;
