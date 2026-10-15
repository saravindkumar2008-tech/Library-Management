import React from "react";
import { useLibrary } from "../context/LibraryContext";
import OptimizedBookCover from "./common/OptimizedBookCover";

function ReadingHistory() {
  const { readingHistory } = useLibrary();

  return (
    <div className="history-view">
      <div className="section-header-bar">
        <div>
          <h2>Reading History</h2>
          <p className="subtitle">
            All books you have borrowed and returned to the library.
          </p>
        </div>
      </div>

      {/* Conditional Rendering: "No reading history available" (Requirement h) */}
      {readingHistory.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">📜</div>
          <h3>No reading history available</h3>
          <p>You haven't completed or returned any books yet. Borrow and return books to build your reading history!</p>
        </div>
      ) : (
        <div className="history-grid">
          {readingHistory.map((book, idx) => (
            <div key={`${book.id}-${idx}`} className="history-card">
              <div className="history-card-header">
                <span className="history-icon">📖</span>
                <span className="history-status-badge">✓ Returned & Completed</span>
              </div>

              <div style={{ display: "flex", gap: "14px", marginTop: "10px" }}>
                <div style={{ width: "65px", flexShrink: 0 }}>
                  <OptimizedBookCover book={book} size="sm" showBadge={false} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem" }}>{book.title}</h3>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem" }}>
                    <strong>Author:</strong> {book.author}
                  </p>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.82rem" }}>
                    <strong>Category:</strong> {book.category}
                  </p>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.82rem" }}>
                    <strong>Published:</strong> {book.year}
                  </p>
                  <p className="return-date" style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--success)" }}>
                    <strong>Returned On:</strong> {book.returnedDate || "Recently"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReadingHistory;
