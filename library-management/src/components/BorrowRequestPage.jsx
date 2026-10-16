import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import Input from "./Input";
import Button from "./Button";
import BookStatus from "./BookStatus";
import OptimizedBookCover from "./common/OptimizedBookCover";
import { validateBorrowForm } from "../utils/validation";

/**
 * BorrowRequestPage Component
 * Form Validation for: Required fields, Email, Phone, Member ID, Loan duration, and Terms.
 * Programmatic Navigation with useNavigate() through borrowing flow.
 */
export function BorrowRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, member, borrowBook, placeHold } = useLibrary();
  const { currentUser } = useAuth();

  const activeUser = currentUser || member;

  const [formData, setFormData] = useState({
    borrowerName: activeUser?.name || "Aravind Kumar",
    memberId: activeUser?.memberId || "AK-LIB-101",
    email: activeUser?.email || "aravind.kumar@gmail.com",
    phone: activeUser?.phone || "+91 98765 43210",
    loanDuration: 14,
    pickupLocation: activeUser?.branch || "AK Central Library, Chennai",
    agreeTerms: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Match book
  const book = books.find(
    (b) => String(b.id) === String(id) || String(b.id) === String(Number(id) - 100)
  );

  if (!book) {
    return (
      <div className="empty-box">
        <h3>Book not found for circulation request</h3>
        <p>Invalid book ID: {id}</p>
        <Button variant="primary" onClick={() => navigate("/books")}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  const isAvailable = book.available;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);

    if (touched[name]) {
      const result = validateBorrowForm(updated);
      setErrors((prev) => ({
        ...prev,
        [name]: result.errors[name] || ""
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const result = validateBorrowForm(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: result.errors[field] || ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      borrowerName: true,
      memberId: true,
      email: true,
      phone: true,
      loanDuration: true,
      agreeTerms: true
    });

    const validation = validateBorrowForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    setTimeout(async () => {
      try {
        if (isAvailable) {
          await borrowBook(book.id, formData.loanDuration, `Standard loan (${formData.loanDuration} days)`);
          setSubmitting(false);
          navigate(`/borrow-confirmation/${book.id}`);
        } else {
          placeHold(book.id, "Waitlist hold request");
          setSubmitting(false);
          navigate(`/borrow-confirmation/${book.id}?type=hold`);
        }
      } catch (err) {
        console.error("Borrow request error:", err);
        setSubmitting(false);
      }
    }, 300);
  };

  return (
    <div className="borrow-request-page">
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/books" className="breadcrumb-link">Books</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to={`/book/${book.id}`} className="breadcrumb-link">{book.title}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {isAvailable ? "Borrow Request" : "Hold Request"}
        </span>
      </nav>

      {/* Borrowing Flow Progress Bar */}
      <div className="borrow-flow-steps">
        <div className="flow-step completed">
          <span className="step-num">1</span>
          <span className="step-label">Book Details</span>
        </div>
        <div className="flow-line active"></div>
        <div className="flow-step active">
          <span className="step-num">2</span>
          <span className="step-label">
            {isAvailable ? "Borrow Request" : "Hold Request"}
          </span>
        </div>
        <div className="flow-line"></div>
        <div className="flow-step">
          <span className="step-num">3</span>
          <span className="step-label">Confirmation</span>
        </div>
        <div className="flow-line"></div>
        <div className="flow-step">
          <span className="step-num">4</span>
          <span className="step-label">Member Dashboard</span>
        </div>
      </div>

      <div className="request-card-container">
        <div className="request-card">
          <div className="request-header">
            <h2>{isAvailable ? "📚 Complete Borrow Request" : "⏳ Submit Hold Request"}</h2>
            <p className="subtitle">
              {isAvailable
                ? "Validate your borrower information, choose loan period, and confirm checkout."
                : "This book is currently checked out. Place a hold request to be prioritized when it is returned."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="request-form" noValidate>
            {/* Book Summary Card */}
            <div className="request-summary-box">
              <div style={{ width: "65px", flexShrink: 0 }}>
                <OptimizedBookCover book={book} size="sm" showBadge={false} />
              </div>
              <div className="summary-info">
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Category:</strong> {book.category} | <strong>Year:</strong> {book.year}</p>
                <BookStatus status={isAvailable ? "available" : "borrowed"} />
              </div>
            </div>

            {/* Member Details Section with Form Validation */}
            <div className="form-section">
              <h4>Borrower Credentials & Contact Information</h4>
              <div className="form-row">
                <Input
                  label="Borrower Full Name"
                  id="borrow-name"
                  name="borrowerName"
                  type="text"
                  required
                  value={formData.borrowerName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("borrowerName")}
                  placeholder="Enter full name"
                  error={touched.borrowerName ? errors.borrowerName : ""}
                  icon="👤"
                />

                <Input
                  label="Member ID"
                  id="borrow-memberId"
                  name="memberId"
                  type="text"
                  required
                  value={formData.memberId}
                  onChange={handleChange}
                  onBlur={() => handleBlur("memberId")}
                  placeholder="e.g. AK-LIB-101"
                  error={touched.memberId ? errors.memberId : ""}
                  icon="🪪"
                />
              </div>

              <div className="form-row">
                <Input
                  label="Notification Email"
                  id="borrow-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="member@domain.com"
                  error={touched.email ? errors.email : ""}
                  icon="✉️"
                  helperText="Return notices and renewal reminders will be sent here."
                />

                <Input
                  label="Contact Phone"
                  id="borrow-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  placeholder="+91 98765 43210"
                  error={touched.phone ? errors.phone : ""}
                  icon="📞"
                />
              </div>
            </div>

            {/* Loan Options Section */}
            <div className="form-section">
              <h4>Loan Options & Pickup Branch</h4>
              <div className="form-row">
                <div className="profile-group">
                  <label htmlFor="loanDuration">Loan Duration *</label>
                  <select
                    id="loanDuration"
                    name="loanDuration"
                    value={formData.loanDuration}
                    onChange={handleChange}
                    disabled={!isAvailable}
                    className="form-input-control"
                  >
                    <option value={14}>14 Days (Standard Loan)</option>
                    <option value={21}>21 Days (Extended Scholar Loan)</option>
                    <option value={28}>28 Days (Monthly Loan)</option>
                  </select>
                </div>

                <div className="profile-group">
                  <label htmlFor="pickupLocation">Circulation Branch</label>
                  <select
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className="form-input-control"
                  >
                    <option value="AK Central Library, Chennai">AK Central Library, Chennai</option>
                    <option value="Madurai Heritage Branch">Madurai Heritage Branch</option>
                    <option value="Coimbatore Digital Commons">Coimbatore Digital Commons</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms acceptance with validation */}
            <div className={`terms-checkbox-wrap ${errors.agreeTerms ? "has-error" : ""}`}>
              <label>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                {" "}I confirm that I will return or renew this title before the due date in accordance with library circulation policies.
              </label>
              {errors.agreeTerms && (
                <div className="field-validation-error">⚠️ {errors.agreeTerms}</div>
              )}
            </div>

            {/* Programmatic Navigation Actions using useNavigate */}
            <div className="request-actions">
              <Button
                type="submit"
                variant={isAvailable ? "primary" : "warning"}
                size="lg"
                loading={submitting}
                icon={isAvailable ? "✓" : "⏳"}
                id="btn-confirm-borrow"
              >
                {isAvailable ? "Confirm & Borrow Book" : "Submit Hold Request"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BorrowRequestPage;
