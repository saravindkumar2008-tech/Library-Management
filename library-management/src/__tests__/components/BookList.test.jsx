/**
 * BookList.test.jsx
 * Requirement a: Test book list component.
 * Requirement e: Test loading and error states.
 * Topics: Jest, React Testing Library
 */
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, makeDefaultState, mockAvailableBook } from "../testUtils";
import { INITIAL_BOOKS } from "../../services/mockData";
import BookList from "../../components/BookList";

// ─── Mock child components and hooks ─────────────────────────────────────────
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock("../../components/BookStatus", () => ({ status }) => (
  <span data-testid="book-status">{status}</span>
));
jest.mock("../../components/BorrowButton", () => ({ book }) => (
  <button data-testid="borrow-button">{book.available ? "Borrow" : "Hold"}</button>
));
jest.mock("../../components/Button", () =>
  ({ children, onClick, title }) => (
    <button onClick={onClick} title={title}>{children}</button>
  )
);
jest.mock("../../components/common/Loading", () =>
  ({ message }) => <div data-testid="loading-spinner">{message}</div>
);
jest.mock("../../components/BookFormModal", () =>
  ({ isOpen }) => isOpen ? <div data-testid="book-form-modal" /> : null
);
jest.mock("../../components/DeleteConfirmModal", () =>
  ({ isOpen }) => isOpen ? <div data-testid="delete-modal" /> : null
);

// BookList reads from LibraryContext — mock it
const mockRefetchBooks = jest.fn();
const mockResetFilters = jest.fn();
const mockUpdateBook = jest.fn();
const mockDeleteBook = jest.fn();

jest.mock("../../context/LibraryContext", () => ({
  useLibrary: jest.fn()
}));

import { useLibrary } from "../../context/LibraryContext";

const makeLibraryContext = (overrides = {}) => ({
  filteredBooks: INITIAL_BOOKS,
  booksLoading: false,
  booksError: null,
  refetchBooks: mockRefetchBooks,
  openBookDetail: jest.fn(),
  borrowBook: jest.fn(),
  placeHold: jest.fn(),
  updateBook: mockUpdateBook,
  deleteBook: mockDeleteBook,
  resetFilters: mockResetFilters,
  apiEngine: "axios",
  ...overrides
});

// ─────────────────────────────────────────────────────────────────────────────

describe("BookList Component (Requirements a, e)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibrary.mockReturnValue(makeLibraryContext());
  });

  // ── a) Renders book list ─────────────────────────────────────────────────
  describe("Rendering Book List (Requirement a)", () => {
    test("renders all books from context", () => {
      renderWithProviders(<BookList />);
      INITIAL_BOOKS.forEach((book) => {
        expect(screen.getByText(book.title)).toBeInTheDocument();
      });
    });

    test("renders correct number of BookCard components", () => {
      renderWithProviders(<BookList />);
      const cards = document.querySelectorAll(".book-card");
      // BookCard mock renders titles, so check by title count
      expect(screen.getAllByTestId("book-status").length).toBe(INITIAL_BOOKS.length);
    });
  });

  // ── e) Loading State ─────────────────────────────────────────────────────
  describe("Loading State (Requirement e)", () => {
    test("shows loading spinner when booksLoading is true", () => {
      useLibrary.mockReturnValue(makeLibraryContext({ booksLoading: true }));
      renderWithProviders(<BookList />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("loading message contains API engine name", () => {
      useLibrary.mockReturnValue(
        makeLibraryContext({ booksLoading: true, apiEngine: "axios" })
      );
      renderWithProviders(<BookList />);
      expect(screen.getByTestId("loading-spinner")).toHaveTextContent("AXIOS");
    });

    test("shows skeleton grid when loading", () => {
      useLibrary.mockReturnValue(makeLibraryContext({ booksLoading: true }));
      const { container } = renderWithProviders(<BookList />);
      expect(container.querySelector(".skeleton-grid")).toBeInTheDocument();
    });

    test("does NOT render book list when loading", () => {
      useLibrary.mockReturnValue(makeLibraryContext({ booksLoading: true }));
      renderWithProviders(<BookList />);
      expect(screen.queryByText("Ponniyin Selvan")).not.toBeInTheDocument();
    });
  });

  // ── e) Error State ───────────────────────────────────────────────────────
  describe("Error State (Requirement e)", () => {
    test("shows error message when booksError is set", () => {
      useLibrary.mockReturnValue(
        makeLibraryContext({ booksError: "Network timeout. Please retry." })
      );
      renderWithProviders(<BookList />);
      expect(screen.getByText("Network timeout. Please retry.")).toBeInTheDocument();
    });

    test("shows 'Failed to Load Books Catalog' heading on error", () => {
      useLibrary.mockReturnValue(
        makeLibraryContext({ booksError: "Server error" })
      );
      renderWithProviders(<BookList />);
      expect(screen.getByText("Failed to Load Books Catalog")).toBeInTheDocument();
    });

    test("shows Retry button on error", () => {
      useLibrary.mockReturnValue(
        makeLibraryContext({ booksError: "Server error" })
      );
      renderWithProviders(<BookList />);
      expect(
        screen.getByRole("button", { name: /retry request/i })
      ).toBeInTheDocument();
    });

    test("clicking Retry calls refetchBooks", () => {
      useLibrary.mockReturnValue(
        makeLibraryContext({ booksError: "Server error" })
      );
      renderWithProviders(<BookList />);
      fireEvent.click(screen.getByRole("button", { name: /retry request/i }));
      expect(mockRefetchBooks).toHaveBeenCalledTimes(1);
    });
  });

  // ── Empty State ──────────────────────────────────────────────────────────
  describe("Empty State", () => {
    test("shows empty message when no books match filters", () => {
      useLibrary.mockReturnValue(makeLibraryContext({ filteredBooks: [] }));
      renderWithProviders(<BookList />);
      expect(
        screen.getByText("No books found matching your criteria")
      ).toBeInTheDocument();
    });

    test("'Clear All Filters' button calls resetFilters on empty state", () => {
      useLibrary.mockReturnValue(makeLibraryContext({ filteredBooks: [] }));
      renderWithProviders(<BookList />);
      fireEvent.click(screen.getByText("Clear All Filters"));
      expect(mockResetFilters).toHaveBeenCalledTimes(1);
    });
  });
});
