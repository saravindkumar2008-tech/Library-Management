import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

/**
 * Reusable BorrowButton Component
 * Context-aware button that adapts between "Borrow" and "Place Hold" based on availability
 */
export function BorrowButton({
  book,
  isAvailable,
  onClick,
  size = "md",
  className = "",
  fullWidth = false,
  showIcon = true
}) {
  const navigate = useNavigate();
  const available = isAvailable !== undefined ? isAvailable : book?.available;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(book);
    } else if (book?.id) {
      navigate(`/borrow-request/${book.id}`);
    }
  };

  if (available) {
    return (
      <Button
        variant="primary"
        size={size}
        onClick={handleClick}
        fullWidth={fullWidth}
        icon={showIcon ? "📥" : null}
        className={`btn-borrow-action ${className}`}
        id={book?.id ? `btn-borrow-${book.id}` : "btn-borrow"}
        title={`Borrow ${book?.title || "Book"}`}
      >
        Borrow
      </Button>
    );
  }

  return (
    <Button
      variant="warning"
      size={size}
      onClick={handleClick}
      fullWidth={fullWidth}
      icon={showIcon ? "⏳" : null}
      className={`btn-hold-action ${className}`}
      id={book?.id ? `btn-hold-${book.id}` : "btn-hold"}
      title={`Place hold reservation on ${book?.title || "Book"}`}
    >
      Place Hold
    </Button>
  );
}

export default BorrowButton;
