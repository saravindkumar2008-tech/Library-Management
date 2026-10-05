import React from "react";
import { useLibrary } from "../context/LibraryContext";

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

              <h3>{book.title}</h3>
              <p>
                <strong>Author:</strong> {book.author}
              </p>
              <p>
                <strong>Category:</strong> {book.category}
              </p>
              <p>
                <strong>Published:</strong> {book.year}
              </p>
              <p className="return-date">
                <strong>Returned On:</strong> {book.returnedDate || "Recently"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReadingHistory;
