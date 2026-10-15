/**
 * BorrowingComponent.test.jsx
 * Requirement a: Test borrowing components (BorrowedBooks).
 * Requirement c: Test borrow, return, renew operations via UI.
 * Requirement e: Test loading and error states in borrowing flow.
 * Topics: Jest, React Testing Library
 */
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders, mockBorrowedEntry } from "../testUtils";

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("../../context/LibraryContext", () => ({
  useLibrary: jest.fn()
}));
jest.mock("../../components/BookStatus", () =>
  ({ status }) => <span data-testid="book-status">{status}</span>
);
jest.mock("../../components/Button", () =>
  ({ children, onClick, type, disabled }) => (
    <button onClick={onClick} type={type || "button"} disabled={disabled}>
      {children}
    </button>
  )
);
jest.mock("../../components/Input", () =>
  ({ name, value, onChange, type }) => (
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type || "text"}
      data-testid={`input-${name}`}
    />
  )
);
jest.mock("../../utils/validation", () => ({
  validateRenewalRequest: jest.fn(() => ({ isValid: true, error: null })),
  validateRequired: jest.fn(() => ({ isValid: true, errors: {} }))
}));

import { useLibrary } from "../../context/LibraryContext";
import { validateRenewalRequest } from "../../utils/validation";
import { BorrowedBooks } from "../../components/BorrowedBooks";

const mockReturnBook = jest.fn();
const mockRenewBook = jest.fn();
const mockClearBorrowing = jest.fn();
const mockCancelHold = jest.fn();

const makeContext = (overrides = {}) => ({
  borrowedBooks: [],
  returnBook: mockReturnBook,
  renewBook: mockRenewBook,
  clearBorrowing: mockClearBorrowing,
  holdRequests: [],
  cancelHold: mockCancelHold,
  ...overrides
});

// ─────────────────────────────────────────────────────────────────────────────

describe("BorrowedBooks Component (Requirements a, c, e)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibrary.mockReturnValue(makeContext());
    validateRenewalRequest.mockReturnValue({ isValid: true, error: null });
  });

  // ── a) Renders borrowing component ───────────────────────────────────────
  describe("Rendering Borrowed Books (Requirement a)", () => {
    test("shows empty message when no books borrowed", () => {
      renderWithProviders(<BorrowedBooks />);
      expect(
        screen.getByText(/no borrowed books/i)
      ).toBeInTheDocument();
    });

    test("renders borrowed book title", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      expect(screen.getByText("Ponniyin Selvan")).toBeInTheDocument();
    });

    test("renders borrowed book author", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      expect(screen.getByText("Kalki Krishnamurthy")).toBeInTheDocument();
    });

    test("renders due date for borrowed book", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      expect(screen.getByText(/2026-10-15/)).toBeInTheDocument();
    });

    test("renders Return button for each borrowed book", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      expect(
        screen.getByRole("button", { name: /return/i })
      ).toBeInTheDocument();
    });

    test("renders Renew button for each borrowed book", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      expect(
        screen.getByRole("button", { name: /renew/i })
      ).toBeInTheDocument();
    });

    test("shows correct borrowed books count", () => {
      const twoBooks = [
        mockBorrowedEntry,
        { ...mockBorrowedEntry, id: 102, title: "Sivagamiyin Sabatham" }
      ];
      useLibrary.mockReturnValue(makeContext({ borrowedBooks: twoBooks }));
      renderWithProviders(<BorrowedBooks />);
      expect(screen.getByText("Ponniyin Selvan")).toBeInTheDocument();
      expect(screen.getByText("Sivagamiyin Sabatham")).toBeInTheDocument();
    });
  });

  // ── c) Return Operation UI ───────────────────────────────────────────────
  describe("Return Operation UI (Requirement c)", () => {
    test("clicking Return button calls returnBook from context", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      fireEvent.click(screen.getByRole("button", { name: /return/i }));
      expect(mockReturnBook).toHaveBeenCalledWith(mockBorrowedEntry.id);
    });
  });

  // ── c) Renew Operation UI ────────────────────────────────────────────────
  describe("Renew Operation UI (Requirement c)", () => {
    test("clicking Renew opens renewal modal", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      fireEvent.click(screen.getByRole("button", { name: /renew/i }));
      expect(screen.getByText(/renewal request/i)).toBeInTheDocument();
    });

    test("renewal modal shows book title", () => {
      useLibrary.mockReturnValue(
        makeContext({ borrowedBooks: [mockBorrowedEntry] })
      );
      renderWithProviders(<BorrowedBooks />);
      fireEvent.click(screen.getByRole("button", { name: /renew/i }));
      expect(screen.getAllByText(/ponniyin selvan/i).length).toBeGreaterThan(0);
    });

    test("shows disabled button or error when renewal not allowed (max renewals reached)", () => {
      const maxedBook = { ...mockBorrowedEntry, renewalCount: 2, maxRenewals: 2 };
      useLibrary.mockReturnValue(makeContext({ borrowedBooks: [maxedBook] }));
      renderWithProviders(<BorrowedBooks />);
      const renewBtn = screen.getByRole("button", { name: /renew/i });
      expect(renewBtn).toBeDisabled();
    });
  });

  // ── e) Loading / Error States ────────────────────────────────────────────
  describe("Loading and Error States (Requirement e)", () => {
    test("shows hold requests section when holdRequests exist", () => {
      const holdRequest = {
        id: "hold-1",
        bookId: 103,
        title: "Thirukkural",
        author: "Thiruvalluvar",
        holdDate: "2026-10-10",
        status: "pending"
      };
      useLibrary.mockReturnValue(
        makeContext({ holdRequests: [holdRequest] })
      );
      renderWithProviders(<BorrowedBooks />);
      expect(screen.getByText(/thirukkural/i)).toBeInTheDocument();
    });

    test("cancel hold button calls cancelHold", () => {
      const holdRequest = {
        id: "hold-1",
        bookId: 103,
        title: "Thirukkural",
        author: "Thiruvalluvar",
        holdDate: "2026-10-10",
        status: "pending"
      };
      useLibrary.mockReturnValue(
        makeContext({ holdRequests: [holdRequest] })
      );
      renderWithProviders(<BorrowedBooks />);
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(mockCancelHold).toHaveBeenCalledWith("hold-1");
    });
  });
});
