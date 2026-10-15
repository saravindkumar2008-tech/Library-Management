import React, { useState, useEffect, useRef } from "react";
import { webBookService } from "../services/webBookService";
import OptimizedBookCover from "./common/OptimizedBookCover";
import { WebSearchSkeleton } from "./common/Skeletons";
import Button from "./Button";

/**
 * WebBookSearchModal Component
 * Enables searching for books and their cover images directly from the web
 * (Open Library & Google Books API), with image lazy loading and instant library import.
 */
export function WebBookSearchModal({ isOpen, onClose, onAddBook }) {
  const [query, setQuery] = useState("Ponniyin Selvan");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedBookIds, setAddedBookIds] = useState(new Set());
  const inputRef = useRef(null);

  const searchWeb = async (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const books = await webBookService.searchBooksFromWeb(searchTerm, { limit: 12 });
      setResults(books);
      if (books.length === 0) {
        setError(`No books found on Open Library / Google Books for "${searchTerm}". Try a different title or author.`);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Web book search error:", err);
        setError("Failed to fetch web results. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      searchWeb(query || "Tamil");
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchWeb(query);
  };

  const handleAddBookToCatalog = async (book) => {
    if (addedBookIds.has(book.id)) return;
    try {
      await onAddBook({
        title: book.title,
        author: book.author,
        category: book.category || "Classic Literature",
        year: Number(book.year) || new Date().getFullYear(),
        isbn: book.isbn,
        rating: Number(book.rating) || 4.8,
        pages: Number(book.pages) || 350,
        coverImage: book.coverImage,
        description: book.description || `Imported from Open Library Web repository (${book.title}).`,
        available: true
      });
      setAddedBookIds((prev) => new Set([...prev, book.id]));
    } catch (e) {
      console.error("Failed to add web book:", e);
    }
  };

  const quickPicks = [
    "Ponniyin Selvan",
    "Thirukkural",
    "Sivagamiyin Sabatham",
    "Velpari",
    "Tamil Classics",
    "Science Fiction",
    "History"
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container web-book-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="web-search-title"
        style={{ maxWidth: "860px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-header">
          <div>
            <h2 id="web-search-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🌐</span> Search Books & Images from Web
            </h2>
            <p className="modal-subtitle">
              Query real-time public repositories (Open Library & Google Books) for covers and book details
            </p>
          </div>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: "14px", display: "flex", gap: "10px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              ref={inputRef}
              type="search"
              className="main-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, or keyword (e.g. Thirukkural, Kalki, Astrophysics)..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px" }}
            />
          </div>
          <Button type="submit" variant="primary" loading={loading} icon="🔍">
            {loading ? "Searching Web..." : "Search Web"}
          </Button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="web-quick-chips" style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center", marginRight: "4px" }}>
            Suggestions:
          </span>
          {quickPicks.map((pick) => (
            <button
              key={pick}
              type="button"
              className="quick-chip-btn"
              onClick={() => {
                setQuery(pick);
                searchWeb(pick);
              }}
              style={{
                fontSize: "0.78rem",
                padding: "4px 10px",
                borderRadius: "14px",
                background: query === pick ? "var(--primary)" : "rgba(255,255,255,0.06)",
                color: query === pick ? "#ffffff" : "var(--text-secondary)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {pick}
            </button>
          ))}
        </div>

        {/* Modal Results Content */}
        <div className="web-search-results-scroll" style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
          {loading ? (
            <WebSearchSkeleton count={6} />
          ) : error ? (
            <div className="empty-box" style={{ padding: "30px 20px" }}>
              <div className="empty-icon">🔍</div>
              <h3>{error}</h3>
              <p>Try searching another title, checking spelling, or selecting a suggestion above.</p>
            </div>
          ) : (
            <div
              className="web-results-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: "18px"
              }}
            >
              {results.map((book) => {
                const isAdded = addedBookIds.has(book.id);
                return (
                  <div
                    key={book.id}
                    className="web-book-item-card"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                  >
                    <div>
                      {/* Optimized Book Cover with Lazy Loading */}
                      <div style={{ marginBottom: "10px" }}>
                        <OptimizedBookCover book={book} size="sm" showBadge={false} />
                      </div>
                      <h4
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          margin: "0 0 4px 0",
                          color: "var(--text-primary)",
                          lineHeight: 1.3
                        }}
                      >
                        {book.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                          margin: "0 0 4px 0"
                        }}
                      >
                        By <strong>{book.author}</strong>
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginBottom: "12px"
                        }}
                      >
                        <span>Year: {book.year}</span>
                        <span>⭐ {book.rating}</span>
                      </div>
                    </div>

                    <Button
                      variant={isAdded ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleAddBookToCatalog(book)}
                      disabled={isAdded}
                      icon={isAdded ? "✓" : "➕"}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {isAdded ? "Added to Catalog" : "Add to Library"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            ⚡ Real-time web covers fetched via Open Library & Google Books
          </span>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WebBookSearchModal;
