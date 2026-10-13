/**
 * Alternative State Management Implementation using Zustand
 * Topics: Zustand, Middleware (persist, devtools)
 * Provides equivalent global store with actions and browser storage synchronization.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { INITIAL_BOOKS, DEFAULT_MEMBER_DATA } from "../services/mockData";

export const useZustandLibraryStore = create(
  persist(
    (set, get) => ({
      books: INITIAL_BOOKS,
      borrowedBooks: [],
      member: DEFAULT_MEMBER_DATA,
      readingHistory: [],
      holdRequests: [],
      filters: { search: "", category: "All", author: "All", availability: "All" },
      loading: false,
      error: null,

      borrowBook: (bookId, durationDays = 14) => {
        const { books, borrowedBooks, member } = get();
        const book = books.find((b) => String(b.id) === String(bookId));
        if (!book || !book.available) return false;

        const dueStr = new Date(Date.now() + durationDays * 86400000).toISOString().split("T")[0];
        const updatedBooks = books.map((b) => (b.id === book.id ? { ...b, available: false } : b));
        const newBorrow = {
          ...book,
          available: false,
          borrowDate: new Date().toISOString().split("T")[0],
          dueDate: dueStr,
          renewalCount: 0,
          maxRenewals: 2
        };

        set({
          books: updatedBooks,
          borrowedBooks: [...borrowedBooks, newBorrow],
          member: { ...member, activeLoansCount: borrowedBooks.length + 1 }
        });
        return true;
      },

      returnBook: (bookId) => {
        const { books, borrowedBooks, readingHistory, member } = get();
        const item = borrowedBooks.find((b) => String(b.id) === String(bookId));
        if (!item) return false;

        set({
          books: books.map((b) => (String(b.id) === String(bookId) ? { ...b, available: true } : b)),
          borrowedBooks: borrowedBooks.filter((b) => String(b.id) !== String(bookId)),
          readingHistory: [
            {
              ...item,
              returnDate: new Date().toISOString().split("T")[0],
              daysKept: 14,
              rating: 5
            },
            ...readingHistory
          ],
          member: { ...member, activeLoansCount: Math.max(0, borrowedBooks.length - 1) }
        });
        return true;
      },

      renewBook: (bookId) => {
        const { borrowedBooks } = get();
        const item = borrowedBooks.find((b) => String(b.id) === String(bookId));
        if (!item || (item.renewalCount || 0) >= 2) return false;

        const currentDue = new Date(item.dueDate || Date.now());
        const newDue = new Date(currentDue.getTime() + 7 * 86400000).toISOString().split("T")[0];

        set({
          borrowedBooks: borrowedBooks.map((b) =>
            String(b.id) === String(bookId)
              ? { ...b, dueDate: newDue, renewalCount: (b.renewalCount || 0) + 1 }
              : b
          )
        });
        return true;
      },

      placeHold: (bookId) => {
        const { books, holdRequests } = get();
        const book = books.find((b) => String(b.id) === String(bookId));
        if (!book) return false;

        set({
          holdRequests: [
            ...holdRequests,
            {
              id: "HOLD-" + Date.now(),
              bookId: book.id,
              bookTitle: book.title,
              holdDate: new Date().toISOString().split("T")[0],
              status: "Active"
            }
          ]
        });
        return true;
      }
    }),
    {
      name: "zustand_library_store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
