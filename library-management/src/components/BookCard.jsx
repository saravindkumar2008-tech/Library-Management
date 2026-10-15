import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import BookStatus from "./BookStatus";
import BorrowButton from "./BorrowButton";
import OptimizedBookCover from "./common/OptimizedBookCover";
import { bookService } from "../services/bookService";

/**
 * Reusable BookCard Component
 * Utilizes reusable Button, BookStatus, and BorrowButton components.
 * Includes Edit (PUT) and Delete (DELETE) CRUD action buttons.
 * Optimized with image lazy loading, instant prefetching on hover, and accessibility enhancements.
 */
export function BookCard({ book, onEdit, onDelete }) {
  const navigate = useNavigate();
  const isAvailable = book.available;

  // Prefetch API data when user hovers or focuses on card
  const handlePrefetch = () => {
    if (book && book.id) {
      bookService.prefetchBook(book.id);
    }
  };

  return (
    <div
      className={`book-card ${!isAvailable ? "unavailable-card" : ""}`}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      role="article"
      aria-label={`Book card for ${book.title} by ${book.author}`}
    >
      <div className="book-card-header">
        <div className="book-icon" aria-hidden="true">📖</div>
        {/* Reusable BookStatus Component */}
        <BookStatus status={isAvailable ? "available" : "borrowed"} />
      </div>

      {/* Optimized Book Cover with Lazy Loading & Zero Layout Shift */}
      <div className="book-card-cover-wrap" style={{ margin: "10px 0 14px 0" }}>
        <OptimizedBookCover book={book} size="sm" />
      </div>

      <Link
        to={`/book/${book.id}`}
        className="book-card-title-link"
        aria-label={`View details for ${book.title}`}
      >
        <h3 id={`book-title-${book.id}`}>{book.title}</h3>
      </Link>

      <p className="book-author">
        <strong>Author:</strong> {book.author}
      </p>
      <p className="book-category">
        <strong>Category:</strong> {book.category}
      </p>
      <p className="book-year">
        <strong>Published:</strong> {book.year}
      </p>

      {/* Conditional Rendering: "Book currently unavailable" */}
      {!isAvailable && (
        <div className="unavailable-notice" role="alert">
          ⚠️ Book currently unavailable
        </div>
      )}

      <div className="card-actions">
        {/* Reusable Button component for Details */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/book/${book.id}`)}
          title={`View details for ${book.title}`}
          aria-label={`View details for ${book.title}`}
          icon="ℹ️"
        >
          Details
        </Button>

        {/* Reusable BorrowButton component */}
        <BorrowButton
          book={book}
          size="sm"
        />

        {/* CRUD Action: Edit Book (PUT/PATCH) */}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(book)}
            title={`Edit ${book.title} (PUT/PATCH)`}
            aria-label={`Edit ${book.title}`}
            icon="✏️"
          >
            Edit
          </Button>
        )}

        {/* CRUD Action: Delete Book (DELETE) */}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(book)}
            title={`Delete ${book.title} (DELETE)`}
            aria-label={`Delete ${book.title}`}
            icon="🗑️"
          >
            Del
          </Button>
        )}
      </div>
    </div>
  );
}

export default BookCard;
