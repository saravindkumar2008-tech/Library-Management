import React from "react";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "./BookCard";

function BookList() {
  const {
    filteredBooks,
    openBookDetail,
    borrowBook,
    placeHold,
    resetFilters
  } = useLibrary();

  // Conditional Rendering: "No books found" (Requirement h)
  if (filteredBooks.length === 0) {
    return (
      <div className="empty-box">
        <div className="empty-icon">🔍</div>
        <h3>No books found</h3>
        <p>No books match your current search and filter criteria.</p>
        <button className="reset-btn" onClick={resetFilters}>
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="book-list">
      {filteredBooks.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          openBookDetail={openBookDetail}
          borrowBook={borrowBook}
          placeHold={placeHold}
        />
      ))}
    </div>
  );
}

export default BookList;
