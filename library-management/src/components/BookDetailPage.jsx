import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, borrowedBooks, holdRequests, member } = useLibrary();

  // Find book by matching ID as string or number
  const book = books.find(
    (b) => String(b.id) === String(id) || String(b.id) === String(Number(id) - 100)
  );

  if (!book) {
    return (
      <div className="book-detail-page empty-box">
        <div className="empty-icon">📖</div>
        <h2>Book Not Found</h2>
        <p>No book in the catalog matches ID: <strong>{id}</strong>.</p>
        <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn-primary" onClick={() => navigate("/books")}>
            Back to Book Catalog
          </button>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Check if currently borrowed by this member
  const currentBorrow = borrowedBooks.find((b) => String(b.id) === String(book.id));
  const currentHold = holdRequests.find((h) => String(h.bookId) === String(book.id));

  // Determine borrowing status details
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

  // Programmatic navigation to Borrow / Hold Request page using useNavigate()
  const handleProceedToBorrow = () => {
    navigate(`/borrow-request/${book.id}`);
  };

  return (
    <div className="book-detail-page">
      {/* Breadcrumb Navigation using Link */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/books" className="breadcrumb-link">Books</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{book.title}</span>
      </nav>

      <div className="book-detail-card">
        <div className="book-detail-cover">
          <div className="book-cover-art">
            <span className="cover-icon">📚</span>
            <span className="cover-category-badge">{book.category}</span>
          </div>
          <div className="book-callout-box">
            <p><strong>Catalog ID:</strong> #{book.id}</p>
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

          {/* Programmatic Navigation Actions using useNavigate */}
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

            <Link to="/books" className="btn-secondary-link">
              Browse All Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
