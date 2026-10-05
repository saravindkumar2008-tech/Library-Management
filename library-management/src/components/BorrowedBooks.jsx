import React, { useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import Button from "./Button";
import BookStatus from "./BookStatus";
import Input from "./Input";
import { validateRenewalRequest, validateRequired } from "../utils/validation";

/**
 * BorrowedBooks Component
 * Topics: Reusable components, Renewal Request form validation, Return / Renew flow
 */
export function BorrowedBooks() {
  const {
    borrowedBooks,
    returnBook,
    renewBook,
    clearBorrowing,
    holdRequests,
    cancelHold
  } = useLibrary();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Renewal Modal State for Form Validation
  const [activeRenewalBook, setActiveRenewalBook] = useState(null);
  const [renewalForm, setRenewalForm] = useState({
    extensionDays: 7,
    reason: "",
    confirmTerms: false
  });
  const [renewalErrors, setRenewalErrors] = useState({});
  const [renewalTouched, setRenewalTouched] = useState({});

  const openRenewalModal = (book) => {
    // Preliminary check
    const check = validateRenewalRequest(book);
    if (!check.isValid) {
      alert(check.error);
      return;
    }
    setActiveRenewalBook(book);
    setRenewalForm({
      extensionDays: 7,
      reason: "",
      confirmTerms: false
    });
    setRenewalErrors({});
    setRenewalTouched({});
  };

  const closeRenewalModal = () => {
    setActiveRenewalBook(null);
    setRenewalErrors({});
  };

  const handleRenewalSubmit = (e) => {
    e.preventDefault();

    setRenewalTouched({
      reason: true,
      confirmTerms: true
    });

    const errors = {};
    const reasonErr = validateRequired(renewalForm.reason, "Renewal reason");
    if (reasonErr) {
      errors.reason = reasonErr;
    } else if (renewalForm.reason.trim().length < 5) {
      errors.reason = "Please provide at least 5 characters for the renewal reason";
    }

    if (!renewalForm.confirmTerms) {
      errors.confirmTerms = "You must acknowledge the circulation renewal terms";
    }

    // Also run business logic validation
    const check = validateRenewalRequest(activeRenewalBook);
    if (!check.isValid) {
      errors.general = check.error;
    }

    if (Object.keys(errors).length > 0) {
      setRenewalErrors(errors);
      return;
    }

    // Process renewal
    renewBook(activeRenewalBook.id);
    closeRenewalModal();
  };

  return (
    <div className="borrowed-view">
      <div className="section-header-bar">
        <div>
          <h2>Borrowed Books & Active Loans</h2>
          <p className="subtitle">
            Manage your currently checked-out books, renewal eligibility validation, and returns.
          </p>
        </div>

        {borrowedBooks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearBorrowing}
            className="btn-danger-outline"
          >
            Clear All Borrowings
          </Button>
        )}
      </div>

      {/* Conditional Rendering: "No borrowed books" */}
      {borrowedBooks.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">📚</div>
          <h3>No borrowed books</h3>
          <p>You do not have any books currently checked out from AK Library.</p>
        </div>
      ) : (
        <div className="borrowed-grid">
          {borrowedBooks.map((book) => {
            const dueDateObj = new Date(book.dueDate);
            dueDateObj.setHours(0, 0, 0, 0);

            const isOverdue = dueDateObj < today;
            const diffTime = dueDateObj - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isDueSoon = !isOverdue && diffDays >= 0 && diffDays <= 3;

            const renewalsUsed = book.renewalCount || 0;
            const maxRenewals = book.maxRenewals || 2;
            const isRenewalAvailable = renewalsUsed < maxRenewals;

            return (
              <div
                key={book.id}
                className={`borrowed-card ${isOverdue ? "card-overdue" : isDueSoon ? "card-duesoon" : ""}`}
              >
                <div className="borrowed-card-header">
                  <h3>{book.title}</h3>
                  <BookStatus
                    status={isOverdue ? "overdue" : isDueSoon ? "dueSoon" : "borrowed"}
                    customLabel={isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Active Loan"}
                  />
                </div>

                <p className="author-text">
                  <strong>Author:</strong> {book.author}
                </p>
                <p className="category-text">
                  <strong>Category:</strong> {book.category}
                </p>
                <p className="date-info">
                  <strong>Borrowed On:</strong> {book.borrowedDate || "Recently"}
                </p>
                <p className="date-info">
                  <strong>Due Date: </strong>
                  <span className={isOverdue ? "overdue-date" : "ontime-date"}>
                    {book.dueDate}
                    {isOverdue && ` (${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} late)`}
                    {isDueSoon && ` (${diffDays} day${diffDays > 1 ? "s" : ""} left)`}
                  </span>
                </p>

                <div className="renewal-status-bar">
                  <span className="renewal-count-badge">
                    Renewals Used: {renewalsUsed} / {maxRenewals}
                  </span>

                  {!isRenewalAvailable ? (
                    <div className="renewal-unavailable-notice">
                      ⚠️ Book renewal is not available (Limit Reached)
                    </div>
                  ) : null}
                </div>

                <div className="borrowed-card-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openRenewalModal(book)}
                    disabled={!isRenewalAvailable}
                    icon="⏳"
                    title={
                      isRenewalAvailable
                        ? "Submit a renewal request form"
                        : "Maximum renewals reached"
                    }
                  >
                    Request Renewal
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => returnBook(book.id)}
                    icon="↩️"
                  >
                    Return Book
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renewal Request Modal with Form Validation (Requirement f) */}
      {activeRenewalBook && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="renewal-modal-card">
            <div className="modal-header">
              <h3>⏳ Loan Renewal Request Form</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={closeRenewalModal}
              >
                ✕
              </button>
            </div>

            <p className="modal-subtitle">
              Submit a formal extension request for <strong>{activeRenewalBook.title}</strong>.
            </p>

            {renewalErrors.general && (
              <div className="field-validation-error alert-box">
                ⚠️ {renewalErrors.general}
              </div>
            )}

            <form onSubmit={handleRenewalSubmit} noValidate>
              <div className="form-section">
                <div className="profile-group">
                  <label htmlFor="renew-duration">Extension Period *</label>
                  <select
                    id="renew-duration"
                    value={renewalForm.extensionDays}
                    onChange={(e) =>
                      setRenewalForm({
                        ...renewalForm,
                        extensionDays: Number(e.target.value)
                      })
                    }
                    className="form-input-control"
                  >
                    <option value={7}>+7 Days Extension</option>
                    <option value={14}>+14 Days Extension (Scholar Tier)</option>
                  </select>
                </div>

                <Input
                  label="Reason for Renewal Request"
                  id="renew-reason"
                  name="reason"
                  type="text"
                  required
                  value={renewalForm.reason}
                  onChange={(e) => {
                    setRenewalForm({ ...renewalForm, reason: e.target.value });
                    if (renewalTouched.reason && e.target.value.trim().length >= 5) {
                      setRenewalErrors((prev) => ({ ...prev, reason: "" }));
                    }
                  }}
                  onBlur={() => setRenewalTouched((prev) => ({ ...prev, reason: true }))}
                  placeholder="e.g., Continuing chapter research, need extra study time"
                  error={renewalTouched.reason ? renewalErrors.reason : ""}
                  icon="📝"
                  helperText="Required field: minimum 5 characters."
                />

                <div
                  className={`terms-checkbox-wrap ${renewalErrors.confirmTerms ? "has-error" : ""}`}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={renewalForm.confirmTerms}
                      onChange={(e) => {
                        setRenewalForm({
                          ...renewalForm,
                          confirmTerms: e.target.checked
                        });
                        if (e.target.checked) {
                          setRenewalErrors((prev) => ({ ...prev, confirmTerms: "" }));
                        }
                      }}
                    />
                    {" "}I understand that renewals depend on waitlist demand and agree to return upon notice.
                  </label>
                  {renewalTouched.confirmTerms && renewalErrors.confirmTerms && (
                    <div className="field-validation-error">
                      ⚠️ {renewalErrors.confirmTerms}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon="✓"
                >
                  Validate & Confirm Renewal
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={closeRenewalModal}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hold Requests Section */}
      {holdRequests.length > 0 && (
        <div className="holds-section">
          <h3>Your Active Hold Reservations ({holdRequests.length})</h3>
          <div className="holds-list">
            {holdRequests.map((hold) => (
              <div key={hold.id} className="hold-item">
                <div className="hold-info">
                  <h4>{hold.title}</h4>
                  <p>
                    <strong>Author:</strong> {hold.author} |{" "}
                    <strong>Requested on:</strong> {hold.holdDate}
                  </p>
                  <BookStatus status="hold" customLabel={`Status: ${hold.status}`} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelHold(hold.id)}
                  className="btn-danger-outline"
                >
                  Cancel Reservation
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BorrowedBooks;
