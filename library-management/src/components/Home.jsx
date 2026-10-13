import React from "react";
import { useLibrary } from "../context/LibraryContext";
import BookList from "./BookList";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import Recommendations from "./Recommendations";

function Home() {
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
    apiEngine,
    setApiEngine,
    simulatedDelay,
    setSimulatedDelay,
    simulateError,
    setSimulateError,
    refetchBooks
  } = useLibrary();

  return (
    <div className="home-view">
      {/* REST API Controls & Status Toolbar */}
      <div className="api-control-toolbar">
        <div className="api-toolbar-left">
          <span className="api-pulse-dot"></span>
          <span className="api-label">REST API Status:</span>
          <span className="api-badge-online">Active (v1)</span>

          {/* Engine Selector: Axios vs Fetch (Experiment 1 Core Topic) */}
          <div className="api-engine-selector">
            <span className="selector-title">Client Engine:</span>
            <button
              type="button"
              className={`btn-engine-toggle ${apiEngine === "axios" ? "active" : ""}`}
              onClick={() => {
                setApiEngine("axios");
                refetchBooks();
              }}
              title="Use Axios HTTP Client with Interceptors"
            >
              Axios
            </button>
            <button
              type="button"
              className={`btn-engine-toggle ${apiEngine === "fetch" ? "active" : ""}`}
              onClick={() => {
                setApiEngine("fetch");
                refetchBooks();
              }}
              title="Use Native Fetch API with AbortController"
            >
              Fetch
            </button>
          </div>
        </div>

        <div className="api-toolbar-right">
          {/* Latency Simulator */}
          <div className="simulation-item">
            <label htmlFor="delay-select">Delay:</label>
            <select
              id="delay-select"
              value={simulatedDelay}
              onChange={(e) => setSimulatedDelay(Number(e.target.value))}
            >
              <option value="0">0ms (Instant)</option>
              <option value="400">400ms (Normal)</option>
              <option value="1000">1000ms (Slow 3G)</option>
              <option value="2000">2000ms (Heavy)</option>
            </select>
          </div>

          {/* Error Simulator */}
          <div className="simulation-item">
            <label htmlFor="error-select">Simulate Error:</label>
            <select
              id="error-select"
              value={simulateError || "none"}
              onChange={(e) => {
                const val = e.target.value === "none" ? null : e.target.value;
                setSimulateError(val);
                refetchBooks();
              }}
            >
              <option value="none">None (200 OK)</option>
              <option value="HTTP_500">500 Server Error</option>
              <option value="NETWORK_ERROR">Network Drop (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Welcome Banner - Member fetched via REST API */}
      <div className="welcome-hero">
        <div className="welcome-text">
          <h2>Vanakkam, {member?.name || "Aravind Kumar"}! 📖</h2>
          <p>
            Explore our curated digital repository of classical and contemporary Tamil literature.
            Check availability, borrow instantly, manage holds, and track your reading journey.
          </p>
          <div className="api-subtext">
            <span>⚡ Member profile loaded via <code>GET /api/members/current</code> using <strong>{apiEngine.toUpperCase()}</strong></span>
          </div>
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
        <SearchBar />
        <FilterPanel />
      </div>

      {/* API-Based Recommendations Section (Requirement f) */}
      <Recommendations />

      {/* Book Catalog Header */}
      <div className="catalog-header">
        <div>
          <h2>Tamil Book Catalog</h2>
          <span className="catalog-count-pill">
            {books.length} {books.length === 1 ? "book" : "books"} loaded via REST API
          </span>
        </div>
        <div className="catalog-refresh-btn-wrap">
          <button className="btn-secondary" onClick={refetchBooks} title="Re-fetch catalog from REST API">
            🔄 Refresh Catalog
          </button>
        </div>
      </div>

      {/* Book List with Async Loading and Error States */}
      <BookList />
    </div>
  );
}

export default Home;
