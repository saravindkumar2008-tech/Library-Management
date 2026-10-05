import React from "react";
import { useLibrary } from "../context/LibraryContext";

function BookDetail() {
  const { selectedBook, closeBookDetail, borrowBook, placeHold } = useLibrary();

  if (!selectedBook) return null;

  const isAvailable = selectedBook.available;

  const handleBorrow = () => {
    borrowBook(selectedBook);
    closeBookDetail();
  };

  const handleHold = () => {
    placeHold(selectedBook);
    closeBookDetail();
  };

  return (
    <div className="modal" onClick={closeBookDetail}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedBook.title}</h2>
          <button className="modal-close-btn" onClick={closeBookDetail}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>
            <strong>Author:</strong> {selectedBook.author}
          </p>
          <p>
            <strong>Category:</strong> {selectedBook.category}
          </p>
          <p>
            <strong>Published Year:</strong> {selectedBook.year}
          </p>
          {selectedBook.description && (
            <p className="modal-description">
              <strong>Overview:</strong> {selectedBook.description}
            </p>
          )}

          {/* Conditional Rendering: Availability & "Book currently unavailable" (Requirement h) */}
          <div className="status-section">
            <strong>Status: </strong>
            {isAvailable ? (
              <span className="available-text">● Available for Immediate Checkout</span>
            ) : (
              <div className="unavailable-alert">
                <span className="unavailable-icon">⚠️</span>
                <span><strong>Book currently unavailable</strong> (Currently borrowed by another member)</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          {isAvailable ? (
            <button className="btn-success" onClick={handleBorrow}>
              Borrow Book
            </button>
          ) : (
            <button className="btn-warning" onClick={handleHold}>
              Place Hold Request
            </button>
          )}
          <button className="btn-secondary" onClick={closeBookDetail}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
