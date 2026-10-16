import React, { useState, lazy, Suspense } from "react";
import { useLibrary } from "../context/LibraryContext";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import { BookGridSkeleton } from "./common/Skeletons";

// Lazy load components with React Suspense for maximum performance
const BookList = lazy(() => import("./BookList"));
const Recommendations = lazy(() => import("./Recommendations"));
const BookFormModal = lazy(() => import("./BookFormModal"));
const WebBookSearchModal = lazy(() => import("./WebBookSearchModal"));

function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);

  const {
    books,
    availableBooks,
    borrowedBooks,
    overdueBooks,
    dueSoonBooks,
    member,
    memberLoading,
    memberError,
    refetchMember,
    refetchBooks,
    addBook,
    imageLoadingMode,
    setImageLoadingMode
  } = useLibrary();

  return (
    <div className="home-view">
      {/* DevTools F12 Network Tab Guide & Comparison Banner */}
      <div className="devtools-network-callout" role="region" aria-label="DevTools Network Inspection Guide">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.2rem" }} aria-hidden="true">🔬</span>
            <strong>DevTools (F12) Network Tab Comparison:</strong>
            <div className="api-engine-selector" style={{ margin: 0 }}>
              <span className="selector-title">Image Loading:</span>
              <button
                type="button"
                className={`btn-engine-toggle ${imageLoadingMode === "lazy" ? "active" : ""}`}
                onClick={() => setImageLoadingMode("lazy")}
                title="Lazy Loading: Defers image network requests until scrolled into view (test in F12 Network tab)"
              >
                👁️ Lazy (Scroll)
              </button>
              <button
                type="button"
                className={`btn-engine-toggle ${imageLoadingMode === "normal" ? "active" : ""}`}
                onClick={() => setImageLoadingMode("normal")}
                title="Normal Loading: Eagerly downloads all 15 book cover images at once on load (test in F12 Network tab)"
              >
                ⚡ Normal (All)
              </button>
            </div>
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Open DevTools: press <kbd>F12</kbd> &rarr; <strong>Network</strong> tab &rarr; Filter by <strong>Img</strong>
          </div>
        </div>
        <p style={{ margin: "8px 0 0 0", fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {imageLoadingMode === "lazy" ? (
            <>
              <strong>Lazy Loading active:</strong> Initial page load only fetches images for the top books visible in your screen. As you scroll down the page, notice how new image HTTP requests appear dynamically one by one in the F12 Network tab.
            </>
          ) : (
            <>
              <strong>Normal Loading active:</strong> All 15 book cover images are downloaded immediately in parallel right on initial page load, consuming bandwidth upfront even for books far below the scroll fold.
            </>
          )}
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="welcome-hero">
        <div className="welcome-text">
          <h2 style={{ marginBottom: 0 }}>Vanakkam, {member?.name || "Aravind Kumar"}! 📖</h2>
        </div>
        <div className="member-badge-chip">
          {memberLoading ? (
            <span>Loading member...</span>
          ) : memberError ? (
            <span className="text-danger" onClick={refetchMember} style={{ cursor: "pointer" }}>
              ⚠️ API Error (Click to retry)
            </span>
          ) : (
            <>
              <span>{member?.membershipTier || "Member"}</span> • <span>{member?.memberId}</span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="metrics-summary">
        <div className="metric-card">
          <span className="metric-icon">📚</span>
          <div className="metric-data">
            <h4>Total Collection</h4>
            <p className="metric-number">{books.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">✅</span>
          <div className="metric-data">
            <h4>Available Books</h4>
            <p className="metric-number text-success">{availableBooks.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">📖</span>
          <div className="metric-data">
            <h4>Borrowed Books</h4>
            <p className="metric-number text-info">{borrowedBooks.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">⏰</span>
          <div className="metric-data">
            <h4>Due Soon (≤3 Days)</h4>
            <p className="metric-number text-warning">{dueSoonBooks.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">⚠️</span>
          <div className="metric-data">
            <h4>Overdue Books</h4>
            <p className="metric-number text-danger">{overdueBooks.length}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls (Requirement b) */}
      <div className="search-filter-section">
        <div className="search-meta-hint">
          <span>🔍 Dynamic API query filtering (debounced with request cancellation):</span>
        </div>
        <SearchBar onOpenWebSearch={() => setIsWebSearchOpen(true)} />
        <FilterPanel />
      </div>

      {/* API-Based Recommendations Section with Suspense (Requirement f) */}
      <Suspense
        fallback={
          <div className="recommendations-section" style={{ minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>✨ Loading personalized recommendations...</span>
          </div>
        }
      >
        <Recommendations />
      </Suspense>

      {/* Book Catalog Header */}
      <div className="catalog-header">
        <div>
          <h2>Tamil Book Catalog</h2>
          <span className="catalog-count-pill">
            {books.length} {books.length === 1 ? "book" : "books"} loaded via REST API
          </span>
        </div>
        <div className="catalog-refresh-btn-wrap" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-book-catalog"
            title="Create a new book via POST /api/books"
          >
            ➕ Add New Book (POST API)
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => setIsWebSearchOpen(true)}
            id="btn-web-search-books"
            title="Search books & cover images from Open Library Web"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(37, 99, 235, 0.15)",
              color: "#3b82f6",
              border: "1px solid #3b82f6",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem"
            }}
          >
            🌐 Search Web (Open Library)
          </button>
          <button className="btn-secondary" onClick={refetchBooks} title="Re-fetch catalog from REST API">
            🔄 Refresh Catalog
          </button>
        </div>
      </div>

      {/* Book List with Suspense Loading and Error States */}
      <Suspense fallback={<BookGridSkeleton count={8} title="Loading catalog..." />}>
        <BookList />
      </Suspense>

      {/* Add New Book Modal (POST CRUD) */}
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <BookFormModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            mode="create"
            onSubmit={async (payload) => {
              await addBook(payload);
              setIsAddModalOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* Web Book & Image Search Modal (Open Library / Google Books) */}
      {isWebSearchOpen && (
        <Suspense fallback={null}>
          <WebBookSearchModal
            isOpen={isWebSearchOpen}
            onClose={() => setIsWebSearchOpen(false)}
            onAddBook={async (payload) => {
              await addBook(payload);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default Home;
