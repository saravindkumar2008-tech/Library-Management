import React from "react";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "./BookCard";
import Loading from "./common/Loading";

/**
 * BookList Component
 * Displays book catalog fetched asynchronously via REST API.
 * Handles loading spinners, error alerts with retry button, and empty search results.
 * Satisfies Requirements a, b, d, e.
 */
function BookList() {
  const {
    filteredBooks,
    booksLoading,
    booksError,
    refetchBooks,
    openBookDetail,
    borrowBook,
    placeHold,
    resetFilters,
    apiEngine
  } = useLibrary();

  // Loading State (Requirement e)
  if (booksLoading) {
    return (
      <div className="book-list-loading-wrap">
        <Loading
          message={`Fetching Tamil book catalog from REST API via ${apiEngine.toUpperCase()}...`}
          size="lg"
        />
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="book-card-skeleton">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line text"></div>
              <div className="skeleton-line text short"></div>
              <div className="skeleton-actions"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State with Retry Button (Requirement e)
  if (booksError) {
    return (
      <div className="empty-box error-alert-box">
        <div className="empty-icon">⚠️</div>
        <h3>Failed to Load Books Catalog</h3>
        <p className="error-desc">{booksError}</p>
        <div className="error-actions" style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn-primary" onClick={refetchBooks}>
            🔄 Retry Request ({apiEngine.toUpperCase()})
          </button>
          <button className="btn-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (filteredBooks.length === 0) {
    return (
      <div className="empty-box">
        <div className="empty-icon">🔍</div>
        <h3>No books found matching your criteria</h3>
        <p>Try adjusting your search query, selecting another category, or clearing filters.</p>
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
