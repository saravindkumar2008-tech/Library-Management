import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { bookService } from "../services/bookService";
import Loading from "./common/Loading";
import OptimizedBookCover from "./common/OptimizedBookCover";
import BookFormModal from "./BookFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

/**
 * BookDetailPage Component
 * Dynamically fetches individual book details from the REST API endpoint (GET /api/books/:id).
 * Demonstrates async data fetching, dynamic loading states, error recovery,
 * and full CRUD operations (GET, PUT/PATCH, DELETE).
 * Satisfies Experiment 3 Requirements a, c, d, f.
 */
function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { borrowedBooks, holdRequests, member, apiEngine, updateBook, deleteBook } = useLibrary();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  // CRUD Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Dynamic async fetch from REST API
  const fetchBookDetails = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setStatusCode(null);

    try {
      const data = await bookService.fetchBookById(id, { signal: controller.signal });
      setBook(data);
      setStatusCode(200);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error(`Failed to fetch book #${id} via REST API:`, err);
      setError(err.message || `Unable to load book details for catalog ID #${id}`);
      setStatusCode(err.status || (err.response ? err.response.status : 500));
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  // Loading State (Requirement e)
  if (loading) {
    return (
      <div className="book-detail-page-loading">
        <div className="api-badge-indicator">
          <span>📡 Requesting: <code>GET /api/books/{id}</code> via <strong>{apiEngine.toUpperCase()}</strong></span>
        </div>
        <Loading
          message={`Fetching book #${id} details dynamically from REST API...`}
          size="lg"
        />
      </div>
    );
  }

  // Error State (Requirement e)
  if (error || !book) {
    return (
      <div className="book-detail-page empty-box error-box-card">
        <div className="empty-icon">⚠️</div>
        <h2>{statusCode === 404 ? "Book Not Found (404)" : "Error Loading Book Details"}</h2>
        <p className="error-message-text">
          {error || `No book in catalog matches ID: ${id}`}
        </p>
        <div className="api-error-meta">
          <span><strong>HTTP Status:</strong> {statusCode || "Connection Error"}</span>
          <span><strong>Endpoint:</strong> <code>GET /api/books/{id}</code></span>
          <span><strong>Engine:</strong> {apiEngine}</span>
        </div>
        <div style={{ marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn-primary" onClick={fetchBookDetails}>
            🔄 Retry Request
          </button>
          <button className="btn-secondary" onClick={() => navigate("/books")}>
            Browse Book Catalog
          </button>
        </div>
      </div>
    );
  }

  // Check if currently borrowed or placed on hold
  const currentBorrow = borrowedBooks.find((b) => String(b.id) === String(book.id));
  const currentHold = holdRequests.find((h) => String(h.bookId) === String(book.id));

  let borrowingStatusLabel = "Available for Immediate Checkout";
  let statusBadgeClass = "badge-available";

  if (!book.available) {
    if (currentBorrow) {
      borrowingStatusLabel = `Borrowed by you (Due on ${currentBorrow.dueDate})`;
      statusBadgeClass = "badge-borrowed";
    } else {
      borrowingStatusLabel = "Currently checked out by another member";
      statusBadgeClass = "badge-alert";
    }
  }

  const handleProceedToBorrow = () => {
    navigate(`/borrow-request/${book.id}`);
  };

  return (
    <div className="book-detail-page">
      {/* Dynamic API Info Header */}
      <div className="api-status-banner">
        <span className="api-status-dot"></span>
        <span>Dynamically fetched from REST API: <code>GET /api/books/{book.id}</code></span>
        <span className="api-engine-pill">Engine: {apiEngine.toUpperCase()}</span>
        <span className="api-http-code">Status: 200 OK</span>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/books" className="breadcrumb-link">Books</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{book.title}</span>
      </nav>

      <div className="book-detail-card">
        <div className="book-detail-cover">
          <OptimizedBookCover book={book} size="lg" />
          <div className="book-callout-box">
            <p><strong>Catalog ID:</strong> #{book.id}</p>
            <p><strong>ISBN:</strong> {book.isbn || "978-81846800" + (book.id % 10)}</p>
            <p><strong>Rating:</strong> ⭐ {book.rating || 4.8} / 5.0</p>
            <p><strong>Member Tier:</strong> {member?.membershipTier || "Standard"}</p>
            <p><strong>Borrow Limit:</strong> 14 Days Loan</p>
          </div>
        </div>

        <div className="book-detail-content">
          <div className="book-detail-header">
            <div>
              <span className={`status-badge ${statusBadgeClass}`}>
                {book.available ? "Available" : "Checked Out"}
              </span>
              <h1 className="book-detail-title">{book.title}</h1>
              <p className="book-detail-author">
                By <strong>{book.author}</strong>
              </p>
            </div>
          </div>

          <div className="book-specs-grid">
            <div className="spec-item">
              <span className="spec-label">Category</span>
              <span className="spec-value">{book.category}</span>
            </div>

            <div className="spec-item">
              <span className="spec-label">Published Year</span>
              <span className="spec-value">{book.year}</span>
            </div>

            <div className="spec-item">
              <span className="spec-label">Availability</span>
              <span className={`spec-value ${book.available ? "text-success" : "text-danger"}`}>
                {book.available ? "In Stock (Available)" : "Out of Stock (Unavailable)"}
              </span>
            </div>

            <div className="spec-item">
              <span className="spec-label">Borrowing Status</span>
              <span className="spec-value">
                {borrowingStatusLabel}
              </span>
            </div>
          </div>

          <div className="book-detail-desc">
            <h3>Description</h3>
            <p>{book.description || "A revered literary masterpiece from Tamil heritage."}</p>
          </div>

          {/* Conditional Hold Notice */}
          {currentHold && (
            <div className="hold-active-banner">
              ⏳ You have an active hold on this book (Status: {currentHold.status}).
            </div>
          )}

          {/* Programmatic Navigation Actions */}
          <div className="book-detail-actions">
            {book.available ? (
              <button
                className="btn-primary btn-large"
                onClick={handleProceedToBorrow}
                id="btn-proceed-borrow"
              >
                📥 Proceed to Borrow
              </button>
            ) : (
              <button
                className="btn-warning btn-large"
                onClick={handleProceedToBorrow}
                id="btn-proceed-hold"
              >
                ⏳ Place Hold Request
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsEditModalOpen(true)}
              id="btn-edit-book-detail"
              title="Edit this book via PUT /api/books/:id"
            >
              ✏️ Edit Book (PUT)
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => setIsDeleteModalOpen(true)}
              id="btn-delete-book-detail"
              title="Delete this book via DELETE /api/books/:id"
            >
              🗑️ Delete Book (DELETE)
            </button>

            <button
              className="btn-secondary"
              onClick={fetchBookDetails}
              title="Refresh book from REST API"
            >
              🔄 Refresh API Data
            </button>
          </div>
        </div>
      </div>

      {/* Edit Book Modal (PUT/PATCH CRUD) */}
      <BookFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialBook={book}
        mode="edit"
        onSubmit={async (payload) => {
          const res = await updateBook(book.id, payload);
          if (res?.book) {
            setBook(res.book);
          } else {
            setBook((prev) => ({ ...prev, ...payload }));
          }
          setIsEditModalOpen(false);
        }}
      />

      {/* Delete Book Confirmation Modal (DELETE CRUD) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        book={book}
        onConfirm={async (bookId) => {
          await deleteBook(bookId);
          setIsDeleteModalOpen(false);
          navigate("/books");
        }}
      />
    </div>
  );
}

export default BookDetailPage;
