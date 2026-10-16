/**
 * librarySlice.test.js
 * Requirement c: Test borrow, return, and renew operations.
 * Requirement d: Test book availability status.
 * Topics: Jest, Redux Toolkit
 */
import { configureStore } from "@reduxjs/toolkit";
import libraryReducer, {
  borrowBook,
  returnBook,
  renewBook,
  placeHold,
  resetStore
} from "../../store/librarySlice";
import { INITIAL_BOOKS, DEFAULT_MEMBER_DATA } from "../../services/mockData";

// ─── Store factory ────────────────────────────────────────────────────────────
const makeStore = (preloaded = {}) =>
  configureStore({
    reducer: { library: libraryReducer },
    preloadedState: {
      library: {
        books: INITIAL_BOOKS.map((b) => ({ ...b })),
        borrowedBooks: [],
        readingHistory: [],
        holdRequests: [],
        member: { ...DEFAULT_MEMBER_DATA, maxBooksAllowed: 5, activeLoansCount: 0 },
        filters: { search: "", category: "All", author: "All", availability: "All" },
        loading: false,
        error: null,
        operationFeedback: null,
        lastSyncedAt: new Date().toISOString(),
        ...preloaded
      }
    },
    middleware: (gdm) => gdm({ serializableCheck: false })
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLib = (store) => store.getState().library;
const BOOK_101 = 101; // Ponniyin Selvan — available
const BOOK_102 = 102; // Sivagamiyin Sabatham — available

// ─────────────────────────────────────────────────────────────────────────────

describe("librarySlice — Redux Store Tests", () => {
  // ── c) Borrow Operation ──────────────────────────────────────────────────
  describe("borrowBook (Requirement c)", () => {
    test("marks book as unavailable after borrow", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      const book = getLib(store).books.find((b) => b.id === BOOK_101);
      expect(book.available).toBe(false);
    });

    test("adds borrowed book to borrowedBooks list", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      const borrowed = getLib(store).borrowedBooks;
      expect(borrowed).toHaveLength(1);
      expect(borrowed[0].id).toBe(BOOK_101);
    });

    test("borrowed book has correct status and dueDate", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      const entry = getLib(store).borrowedBooks[0];
      expect(entry.status).toBe("borrowed");
      expect(entry.dueDate).toBeTruthy();
      expect(entry.renewalCount).toBe(0);
    });

    test("updates member activeLoansCount after borrow", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      expect(getLib(store).member.activeLoansCount).toBe(1);
    });

    test("sets success feedback after borrow", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      const fb = getLib(store).operationFeedback;
      expect(fb.type).toBe("success");
      expect(fb.message).toContain("Ponniyin Selvan");
    });

    test("cannot borrow already borrowed book", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      expect(getLib(store).borrowedBooks).toHaveLength(1);
      expect(getLib(store).operationFeedback.type).toBe("error");
    });

    test("cannot borrow non-existent book", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: 9999 }));
      expect(getLib(store).borrowedBooks).toHaveLength(0);
      expect(getLib(store).operationFeedback.type).toBe("error");
    });

    test("enforces max borrow limit (5 books)", () => {
      // Pre-fill 5 borrowed books
      const fullBorrowed = INITIAL_BOOKS.slice(0, 5).map((b) => ({
        ...b,
        available: false,
        borrowDate: "2026-10-01",
        dueDate: "2026-10-15",
        renewalCount: 0,
        maxRenewals: 2,
        status: "borrowed"
      }));
      const modifiedBooks = INITIAL_BOOKS.map((b) => {
        const isBorrowed = fullBorrowed.some((fb) => fb.id === b.id);
        return isBorrowed ? { ...b, available: false } : b;
      });
      const store = makeStore({ borrowedBooks: fullBorrowed, books: modifiedBooks });
      // Try to borrow a 6th book
      const sixthBook = INITIAL_BOOKS.find(
        (b) => !fullBorrowed.some((fb) => fb.id === b.id)
      );
      store.dispatch(borrowBook({ bookId: sixthBook.id }));
      expect(getLib(store).operationFeedback.type).toBe("error");
      expect(getLib(store).operationFeedback.message).toContain("limit");
    });
  });

  // ── c) Return Operation ──────────────────────────────────────────────────
  describe("returnBook (Requirement c)", () => {
    const storeWithBorrowed = () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      return store;
    };

    test("removes book from borrowedBooks on return", () => {
      const store = storeWithBorrowed();
      store.dispatch(returnBook({ bookId: BOOK_101, rating: 5 }));
      expect(getLib(store).borrowedBooks).toHaveLength(0);
    });

    test("marks book as available again after return", () => {
      const store = storeWithBorrowed();
      store.dispatch(returnBook({ bookId: BOOK_101 }));
      const book = getLib(store).books.find((b) => b.id === BOOK_101);
      expect(book.available).toBe(true);
    });

    test("adds returned book to readingHistory", () => {
      const store = storeWithBorrowed();
      store.dispatch(returnBook({ bookId: BOOK_101, rating: 4 }));
      const history = getLib(store).readingHistory;
      expect(history).toHaveLength(1);
      expect(history[0].title).toBe("Ponniyin Selvan");
    });

    test("reading history entry has returnDate and rating", () => {
      const store = storeWithBorrowed();
      store.dispatch(returnBook({ bookId: BOOK_101, rating: 5 }));
      const entry = getLib(store).readingHistory[0];
      expect(entry.returnDate).toBeTruthy();
      expect(entry.rating).toBe(5);
    });

    test("decrements member activeLoansCount after return", () => {
      const store = storeWithBorrowed();
      store.dispatch(returnBook({ bookId: BOOK_101 }));
      expect(getLib(store).member.activeLoansCount).toBe(0);
    });

    test("sets success feedback after return", () => {
      const store = storeWithBorrowed();
      store.dispatch(returnBook({ bookId: BOOK_101 }));
      expect(getLib(store).operationFeedback.type).toBe("success");
    });

    test("error when returning book not in borrowed list", () => {
      const store = makeStore();
      store.dispatch(returnBook({ bookId: BOOK_101 }));
      expect(getLib(store).operationFeedback.type).toBe("error");
    });
  });

  // ── c) Renew Operation ───────────────────────────────────────────────────
  describe("renewBook (Requirement c)", () => {
    const storeWithBorrowed = () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101, durationDays: 14 }));
      return store;
    };

    test("extends due date after renewal", () => {
      const store = storeWithBorrowed();
      const dueBefore = getLib(store).borrowedBooks[0].dueDate;
      store.dispatch(renewBook({ bookId: BOOK_101, extensionDays: 7 }));
      const dueAfter = getLib(store).borrowedBooks[0].dueDate;
      expect(new Date(dueAfter) > new Date(dueBefore)).toBe(true);
    });

    test("increments renewalCount after renewal", () => {
      const store = storeWithBorrowed();
      store.dispatch(renewBook({ bookId: BOOK_101, extensionDays: 7 }));
      expect(getLib(store).borrowedBooks[0].renewalCount).toBe(1);
    });

    test("sets success feedback after renewal", () => {
      const store = storeWithBorrowed();
      store.dispatch(renewBook({ bookId: BOOK_101 }));
      expect(getLib(store).operationFeedback.type).toBe("success");
    });

    test("cannot renew beyond maxRenewals (2)", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      store.dispatch(renewBook({ bookId: BOOK_101 })); // renewalCount = 1
      store.dispatch(renewBook({ bookId: BOOK_101 })); // renewalCount = 2
      store.dispatch(renewBook({ bookId: BOOK_101 })); // should fail
      expect(getLib(store).operationFeedback.type).toBe("error");
      expect(getLib(store).borrowedBooks[0].renewalCount).toBe(2);
    });

    test("error when renewing non-borrowed book", () => {
      const store = makeStore();
      store.dispatch(renewBook({ bookId: BOOK_101 }));
      expect(getLib(store).operationFeedback.type).toBe("error");
    });
  });

  // ── d) Book Availability Status ──────────────────────────────────────────
  describe("Book Availability Status (Requirement d)", () => {
    test("all INITIAL_BOOKS start as available", () => {
      const store = makeStore();
      const unavailable = getLib(store).books.filter((b) => !b.available);
      expect(unavailable).toHaveLength(0);
    });

    test("book becomes unavailable after borrow", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      const book = getLib(store).books.find((b) => b.id === BOOK_101);
      expect(book.available).toBe(false);
    });

    test("book becomes available again after return", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      store.dispatch(returnBook({ bookId: BOOK_101 }));
      const book = getLib(store).books.find((b) => b.id === BOOK_101);
      expect(book.available).toBe(true);
    });

    test("multiple books can be borrowed simultaneously", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      store.dispatch(borrowBook({ bookId: BOOK_102 }));
      expect(getLib(store).borrowedBooks).toHaveLength(2);
      const b101 = getLib(store).books.find((b) => b.id === BOOK_101);
      const b102 = getLib(store).books.find((b) => b.id === BOOK_102);
      expect(b101.available).toBe(false);
      expect(b102.available).toBe(false);
    });
  });

  // ── placeHold ────────────────────────────────────────────────────────────
  describe("placeHold", () => {
    test("adds hold request to holdRequests", () => {
      const store = makeStore();
      store.dispatch(placeHold({ bookId: BOOK_101, notes: "Priority hold" }));
      expect(getLib(store).holdRequests).toHaveLength(1);
    });

    test("hold request contains bookId and notes", () => {
      const store = makeStore();
      store.dispatch(placeHold({ bookId: BOOK_101, notes: "Priority hold" }));
      const hold = getLib(store).holdRequests[0];
      expect(String(hold.bookId)).toBe(String(BOOK_101));
      expect(hold.notes).toBe("Priority hold");
    });
  });

  // ── resetStore ───────────────────────────────────────────────────────────
  describe("resetStore", () => {
    test("resets borrowedBooks to empty after reset", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      store.dispatch(resetStore());
      expect(getLib(store).borrowedBooks).toHaveLength(0);
    });

    test("resets all books to available after reset", () => {
      const store = makeStore();
      store.dispatch(borrowBook({ bookId: BOOK_101 }));
      store.dispatch(resetStore());
      const allAvailable = getLib(store).books.every((b) => b.available);
      expect(allAvailable).toBe(true);
    });
  });
});
