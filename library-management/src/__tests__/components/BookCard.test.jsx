/**
 * BookCard.test.jsx
 * Requirement a: Test book cards component.
 * Requirement d: Test book availability status display.
 * Topics: Jest, React Testing Library
 */
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, mockAvailableBook, mockUnavailableBook } from "../testUtils";
import BookCard from "../../components/BookCard";

// ─── Mock react-router-dom useNavigate ───────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// ─── Mock child components that have their own deep dependencies ─────────────
jest.mock("../../components/BookStatus", () => ({ status }) => (
  <span data-testid="book-status">{status}</span>
));
jest.mock("../../components/BorrowButton", () => ({ book }) => (
  <button data-testid="borrow-button">
    {book.available ? "Borrow" : "Hold"}
  </button>
));
jest.mock("../../components/Button", () =>
  ({ children, onClick, title, variant }) => (
    <button onClick={onClick} title={title} data-variant={variant}>
      {children}
    </button>
  )
);

// ─────────────────────────────────────────────────────────────────────────────

describe("BookCard Component (Requirement a, d)", () => {
  const renderBookCard = (book, props = {}) =>
    renderWithProviders(<BookCard book={book} {...props} />);

  // ── a) Renders book info correctly ──────────────────────────────────────
  describe("Rendering Book Information", () => {
    test("renders book title correctly", () => {
      renderBookCard(mockAvailableBook);
      expect(screen.getByText("Ponniyin Selvan")).toBeInTheDocument();
    });

    test("renders book author correctly", () => {
      renderBookCard(mockAvailableBook);
      expect(screen.getByText("Kalki Krishnamurthy")).toBeInTheDocument();
    });

    test("renders book category correctly", () => {
      renderBookCard(mockAvailableBook);
      expect(screen.getByText("Historical Fiction")).toBeInTheDocument();
    });

    test("renders publication year correctly", () => {
      renderBookCard(mockAvailableBook);
      expect(screen.getByText("1955")).toBeInTheDocument();
    });

    test("renders Details button", () => {
      renderBookCard(mockAvailableBook);
      expect(screen.getByText("Details")).toBeInTheDocument();
    });
  });

  // ── d) Book Availability Status ──────────────────────────────────────────
  describe("Book Availability Status (Requirement d)", () => {
    test("shows 'available' status for available book", () => {
      renderBookCard(mockAvailableBook);
      const status = screen.getByTestId("book-status");
      expect(status).toHaveTextContent("available");
    });

    test("shows 'borrowed' status for unavailable book", () => {
      renderBookCard(mockUnavailableBook);
      const status = screen.getByTestId("book-status");
      expect(status).toHaveTextContent("borrowed");
    });

    test("shows unavailable notice when book is not available", () => {
      renderBookCard(mockUnavailableBook);
      expect(
        screen.getByText("⚠️ Book currently unavailable")
      ).toBeInTheDocument();
    });

    test("does NOT show unavailable notice for available book", () => {
      renderBookCard(mockAvailableBook);
      expect(
        screen.queryByText("⚠️ Book currently unavailable")
      ).not.toBeInTheDocument();
    });

    test("applies 'unavailable-card' CSS class for borrowed book", () => {
      const { container } = renderBookCard(mockUnavailableBook);
      const card = container.querySelector(".book-card");
      expect(card).toHaveClass("unavailable-card");
    });

    test("does NOT apply 'unavailable-card' class for available book", () => {
      const { container } = renderBookCard(mockAvailableBook);
      const card = container.querySelector(".book-card");
      expect(card).not.toHaveClass("unavailable-card");
    });
  });

  // ── Edit / Delete CRUD buttons ───────────────────────────────────────────
  describe("Edit and Delete Actions", () => {
    test("renders Edit button when onEdit prop is provided", () => {
      const onEdit = jest.fn();
      renderBookCard(mockAvailableBook, { onEdit });
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    test("does NOT render Edit button when onEdit is not provided", () => {
      renderBookCard(mockAvailableBook);
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    test("calls onEdit with book when Edit button clicked", () => {
      const onEdit = jest.fn();
      renderBookCard(mockAvailableBook, { onEdit });
      fireEvent.click(screen.getByText("Edit"));
      expect(onEdit).toHaveBeenCalledWith(mockAvailableBook);
    });

    test("renders Delete button when onDelete prop is provided", () => {
      const onDelete = jest.fn();
      renderBookCard(mockAvailableBook, { onDelete });
      expect(screen.getByText("Del")).toBeInTheDocument();
    });

    test("calls onDelete with book when Delete button clicked", () => {
      const onDelete = jest.fn();
      renderBookCard(mockAvailableBook, { onDelete });
      fireEvent.click(screen.getByText("Del"));
      expect(onDelete).toHaveBeenCalledWith(mockAvailableBook);
    });

    test("Details button navigates to book detail page", () => {
      renderBookCard(mockAvailableBook);
      fireEvent.click(screen.getByText("Details"));
      expect(mockNavigate).toHaveBeenCalledWith(`/book/${mockAvailableBook.id}`);
    });
  });
});
