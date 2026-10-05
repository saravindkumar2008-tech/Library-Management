import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import BookStatus from "./BookStatus";
import BorrowButton from "./BorrowButton";

/**
 * Reusable BookCard Component
 * Utilizes reusable Button, BookStatus, and BorrowButton components
 */
export function BookCard({ book }) {
  const navigate = useNavigate();
  const isAvailable = book.available;

  return (
    <div className={`book-card ${!isAvailable ? "unavailable-card" : ""}`}>
      <div className="book-card-header">
        <div className="book-icon">📖</div>
        {/* Reusable BookStatus Component */}
        <BookStatus status={isAvailable ? "available" : "borrowed"} />
      </div>

      <Link to={`/book/${book.id}`} className="book-card-title-link">
        <h3>{book.title}</h3>
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
        <div className="unavailable-notice">
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
          icon="ℹ️"
        >
          Details
        </Button>

        {/* Reusable BorrowButton component */}
        <BorrowButton
          book={book}
          size="sm"
        />
      </div>
    </div>
  );
}

export default BookCard;
