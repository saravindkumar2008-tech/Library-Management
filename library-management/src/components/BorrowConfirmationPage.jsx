import React from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import OptimizedBookCover from "./common/OptimizedBookCover";

function BorrowConfirmationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isHold = searchParams.get("type") === "hold";
  const { books, borrowedBooks, holdRequests, member } = useLibrary();

  const book = books.find(
    (b) => String(b.id) === String(id) || String(b.id) === String(Number(id) - 100)
  );

  const borrowItem = borrowedBooks.find((b) => String(b.id) === String(id));
  const holdItem = holdRequests.find((h) => String(h.bookId) === String(id));

  const confirmationCode = `AK-${isHold ? "HLD" : "BRW"}-${id}-${new Date().getFullYear()}`;

  return (
    <div className="borrow-confirmation-page">
      {/* Borrowing Flow Progress Bar */}
      <div className="borrow-flow-steps">
        <div className="flow-step completed">
          <span className="step-num">✓</span>
          <span className="step-label">Book Details</span>
        </div>
        <div className="flow-line completed"></div>
        <div className="flow-step completed">
          <span className="step-num">✓</span>
          <span className="step-label">{isHold ? "Hold Request" : "Borrow Request"}</span>
        </div>
        <div className="flow-line completed"></div>
        <div className="flow-step active">
          <span className="step-num">3</span>
          <span className="step-label">Confirmation</span>
        </div>
        <div className="flow-line"></div>
        <div className="flow-step">
          <span className="step-num">4</span>
          <span className="step-label">Member Dashboard</span>
        </div>
      </div>

      <div className="confirmation-card-wrap">
        <div className="confirmation-card">
          <div className="confirmation-icon-banner">
            <span className="success-check-icon">{isHold ? "⏳" : "✓"}</span>
          </div>

          <h2 className="confirmation-title">
            {isHold ? "Hold Request Placed Successfully!" : "Borrow Request Confirmed!"}
          </h2>
          <p className="confirmation-subtitle">
            {isHold
              ? "Your reservation has been recorded in the member queue. We will notify you when this book is returned."
              : "Your book has been checked out and added to your active borrowed books."}
          </p>

          <div className="confirmation-receipt">
            <div className="receipt-header">
              <span className="receipt-label">Confirmation ID</span>
              <span className="receipt-code">{confirmationCode}</span>
            </div>

            {book && (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 6px 0" }}>
                <div style={{ width: "90px" }}>
                  <OptimizedBookCover book={book} size="sm" showBadge={false} />
                </div>
              </div>
            )}

            <div className="receipt-body">
              <div className="receipt-row">
                <span>Book Title:</span>
                <strong>{book ? book.title : `Book #${id}`}</strong>
              </div>
              <div className="receipt-row">
                <span>Author:</span>
                <strong>{book ? book.author : "Tamil Scholar"}</strong>
              </div>
              <div className="receipt-row">
                <span>Borrower:</span>
                <strong>{member?.name || "Aravind Kumar"} ({member?.memberId || "AK-LIB-101"})</strong>
              </div>
              <div className="receipt-row">
                <span>Status:</span>
                <span className={`status-badge ${isHold ? "badge-hold" : "badge-available"}`}>
                  {isHold ? "Reserved on Waitlist" : "Active Loan (Checked Out)"}
                </span>
              </div>
              {!isHold && (
                <>
                  <div className="receipt-row">
                    <span>Borrowed On:</span>
                    <strong>{borrowItem?.borrowedDate || new Date().toISOString().split("T")[0]}</strong>
                  </div>
                  <div className="receipt-row highlight-due">
                    <span>Due Date:</span>
                    <strong className="text-warning">
                      {borrowItem?.dueDate || "14 Days from today"}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="receipt-notice">
            <p>
              💡 <strong>Next Steps:</strong> You can manage renewals, track return deadlines, or return this book anytime from your <strong>Member Dashboard</strong>.
            </p>
          </div>

          {/* Programmatic Navigation Actions using useNavigate */}
          <div className="confirmation-actions">
            <button
              className="btn-primary btn-large"
              onClick={() => navigate("/member")}
              id="btn-goto-dashboard"
            >
              📊 Go to Member Dashboard
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate("/member/borrowed")}
              id="btn-goto-borrowed"
            >
              📖 View Borrowed Books
            </button>

            <Link to="/books" className="btn-secondary-link">
              Browse More Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BorrowConfirmationPage;
