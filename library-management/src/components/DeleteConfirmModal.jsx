import React, { useState } from "react";
import Button from "./Button";

/**
 * DeleteConfirmModal Component
 * Confirmation dialog before permanently deleting a book via HTTP DELETE.
 * Satisfies Experiment 3 Requirements d, f.
 */
export function DeleteConfirmModal({ isOpen, onClose, onConfirm, book }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !book) return null;

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(book.id);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-content" style={{ textAlign: "center", padding: "24px 16px" }}>
          <div className="delete-warning-icon" style={{ fontSize: "48px", marginBottom: "16px" }}>
            🗑️
          </div>

          <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--text-main)" }}>
            Delete Book from Library?
          </h2>

          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>
            Are you sure you want to permanently delete <strong>"{book.title}"</strong> by{" "}
            <strong>{book.author}</strong>?
          </p>

          <div
            className="api-delete-callout"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              marginBottom: "20px"
            }}
          >
            ⚠️ This will execute an <strong>HTTP DELETE</strong> request to <code>/api/books/{book.id}</code> and remove the book from the catalog.
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={loading}
              icon="🗑️"
            >
              {loading ? "Deleting..." : "Confirm Delete (DELETE)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
