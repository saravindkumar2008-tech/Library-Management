import React, { useState, useEffect } from "react";
import Button from "./Button";
import Input from "./Input";
import { sanitizeObject } from "../utils/security";

/**
 * BookFormModal Component
 * Handles adding new books (POST) and updating existing books (PUT/PATCH).
 * Displays loading spinners and handles validation errors.
 * Satisfies Experiment 3 Requirements b, c, f.
 */
export function BookFormModal({ isOpen, onClose, onSubmit, initialBook = null, mode = "create" }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Historical Fiction",
    year: new Date().getFullYear(),
    rating: 4.8,
    isbn: "",
    pages: 350,
    available: true,
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialBook) {
      setFormData({
        title: initialBook.title || "",
        author: initialBook.author || "",
        category: initialBook.category || "Historical Fiction",
        year: initialBook.year || 2024,
        rating: initialBook.rating || 4.8,
        isbn: initialBook.isbn || "",
        pages: initialBook.pages || 350,
        available: initialBook.available !== undefined ? initialBook.available : true,
        description: initialBook.description || ""
      });
    } else {
      setFormData({
        title: "",
        author: "",
        category: "Historical Fiction",
        year: new Date().getFullYear(),
        rating: 4.8,
        isbn: `978-818468${Math.floor(1000 + Math.random() * 9000)}`,
        pages: 350,
        available: true,
        description: ""
      });
    }
    setError(null);
  }, [initialBook, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      setError("Title and Author are required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sanitized = sanitizeObject(formData);
      const payload = {
        ...sanitized,
        year: Number(sanitized.year) || new Date().getFullYear(),
        rating: Number(sanitized.rating) || 4.5,
        pages: Number(sanitized.pages) || 300
      };

      await onSubmit(payload);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Form submit error:", err);
      setError(err.message || "Failed to save book to REST API.");
      setLoading(false);
    }
  };

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container book-form-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-form-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="book-form-title">{isEdit ? "✏️ Edit Book (PUT / PATCH)" : "➕ Add New Book (POST)"}</h2>
            <p className="modal-subtitle">
              {isEdit
                ? `Update book information for "${initialBook?.title}" via REST API`
                : "Create a new book record and add it to the library catalog"}
            </p>
          </div>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <div className="empty-box error-alert-box" style={{ padding: "12px", marginBottom: "16px" }}>
            <p style={{ color: "var(--danger)", margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="book-crud-form">
          <div className="form-grid">
            <Input
              label="Book Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Thirukkural, Velpari..."
              required
            />

            <Input
              label="Author Name"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Kalki, Su. Venkatesan..."
              required
            />

            <div className="input-group">
              <label htmlFor="modal-category">Category *</label>
              <select
                id="modal-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="custom-select"
              >
                <option value="Historical Fiction">Historical Fiction</option>
                <option value="Epic Fiction">Epic Fiction</option>
                <option value="Philosophy & Ethics">Philosophy & Ethics</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Folk Literature">Folk Literature</option>
                <option value="Classic Literature">Classic Literature</option>
                <option value="Contemporary Literature">Contemporary Literature</option>
              </select>
            </div>

            <Input
              label="Published Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 1955"
            />

            <Input
              label="ISBN Code"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-8184680010"
            />

            <Input
              label="Pages"
              name="pages"
              type="number"
              value={formData.pages}
              onChange={handleChange}
              placeholder="e.g. 450"
            />

            <Input
              label="Rating (1.0 to 5.0)"
              name="rating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              placeholder="4.8"
            />

            <div className="input-group checkbox-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}>
              <input
                type="checkbox"
                id="modal-available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="modal-available" style={{ cursor: "pointer", fontWeight: 600 }}>
                Available for Immediate Checkout
              </label>
            </div>
          </div>

          <div className="input-group" style={{ marginTop: "16px" }}>
            <label htmlFor="modal-desc">Book Description</label>
            <textarea
              id="modal-desc"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a brief overview of this book's literary plot or significance..."
              className="custom-textarea"
            />
          </div>

          <div className="modal-actions" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={isEdit ? "💾" : "➕"}
            >
              {loading ? (isEdit ? "Updating Book..." : "Creating Book...") : (isEdit ? "Update Book (PUT)" : "Add Book (POST)")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookFormModal;
