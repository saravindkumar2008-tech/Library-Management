import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import OptimizedBookCover from "./common/OptimizedBookCover";

export function SearchBar({ onOpenWebSearch }) {
  const { search, setSearch, books } = useLibrary();
  const searchInputRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filter books for live dropdown preview
  const liveResults = (search || "").trim().length > 0
    ? (books || []).filter((b) => {
        const q = search.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div className="search-bar-wrap" role="search" aria-label="Book search form">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          id="main-search-input"
          ref={searchInputRef}
          type="search"
          className="main-search-input"
          placeholder="Search comic books & graphic novels by title, keyword, or author..."
          aria-label="Search comic books & graphic novels by title, keyword, or author"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          autoComplete="off"
          spellCheck="false"
        />
        {search && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => {
              setSearch("");
              setShowDropdown(false);
            }}
            aria-label="Clear search query"
            title="Clear search"
          >
            ✕
          </button>
        )}
        {onOpenWebSearch && (
          <button
            type="button"
            onClick={() => onOpenWebSearch(search)}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "8px",
              whiteSpace: "nowrap"
            }}
            title="Search books & covers from Open Library Web"
          >
            <span>🌐</span>
            <span>Search Web</span>
          </button>
        )}
      </div>

      {/* Live search dropdown with book thumbnails and web search option */}
      {showDropdown && (search || "").trim().length > 0 && (
        <div
          className="live-search-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            zIndex: 100,
            maxHeight: "360px",
            overflowY: "auto",
            padding: "8px 0"
          }}
        >
          {liveResults.length > 0 ? (
            <div>
              <div style={{ padding: "6px 14px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 700 }}>
                Catalog Matches ({liveResults.length})
              </div>
              {liveResults.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.id}`}
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 14px",
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: "36px", flexShrink: 0 }}>
                    <OptimizedBookCover book={book} size="sm" showBadge={false} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      {book.author} • {book.category}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: book.available ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: book.available ? "#10b981" : "#ef4444",
                      fontWeight: 600
                    }}
                  >
                    {book.available ? "Available" : "Borrowed"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No catalog books found for "{search}"
            </div>
          )}

          {/* Web Search Action inside dropdown */}
          {onOpenWebSearch && (
            <div
              style={{
                padding: "8px 14px",
                borderTop: "1px solid var(--border)",
                marginTop: "4px"
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onOpenWebSearch(search);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  background: "rgba(37, 99, 235, 0.12)",
                  color: "#60a5fa",
                  border: "1px dashed #3b82f6",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.84rem",
                  fontWeight: 600
                }}
              >
                <span>🌐</span>
                <span>Search "{search}" on Open Library & Google Books Web</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
