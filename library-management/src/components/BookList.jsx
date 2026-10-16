import React, { useState, lazy, Suspense } from "react";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "./BookCard";
import Loading from "./common/Loading";

const BookFormModal = lazy(() => import("./BookFormModal"));
const DeleteConfirmModal = lazy(() => import("./DeleteConfirmModal"));

/**
 * BookList Component
 * Displays book catalog fetched asynchronously via REST API.
 * Supports CRUD operations: Read (GET), Update (PUT/PATCH), and Delete (DELETE).
 * Handles loading spinners, error alerts with retry button, and empty search results.
 * Satisfies Experiment 3 Requirements a, c, d, f.
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
    updateBook,
    deleteBook,
    resetFilters,
    apiEngine
  } = useLibrary();

  // CRUD Modals State
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);

  // Loading State (Requirement f)
  if (booksLoading) {
    return (
      <div className="book-list-loading-wrap">
        <Loading
          message={`Fetching comic book catalog from REST API via ${apiEngine.toUpperCase()}...`}
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

  // Error State with Retry Button (Requirement f)
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
    <>
      <div className="book-list">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            openBookDetail={openBookDetail}
            borrowBook={borrowBook}
            placeHold={placeHold}
            onEdit={(b) => setEditingBook(b)}
            onDelete={(b) => setDeletingBook(b)}
          />
        ))}
      </div>

      {/* Edit Book Modal (PUT/PATCH CRUD) */}
      {Boolean(editingBook) && (
        <Suspense fallback={null}>
          <BookFormModal
            isOpen={Boolean(editingBook)}
            onClose={() => setEditingBook(null)}
            initialBook={editingBook}
            mode="edit"
            onSubmit={async (payload) => {
              await updateBook(editingBook.id, payload);
              setEditingBook(null);
            }}
          />
        </Suspense>
      )}

      {/* Delete Book Confirmation Modal (DELETE CRUD) */}
      {Boolean(deletingBook) && (
        <Suspense fallback={null}>
          <DeleteConfirmModal
            isOpen={Boolean(deletingBook)}
            onClose={() => setDeletingBook(null)}
            book={deletingBook}
            onConfirm={async (id) => {
              await deleteBook(id);
              setDeletingBook(null);
            }}
          />
        </Suspense>
      )}
    </>
  );
}

export default BookList;
