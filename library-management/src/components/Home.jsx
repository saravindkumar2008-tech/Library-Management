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
    member
  } = useLibrary();

  return (
    <div className="home-view">
      {/* Welcome Banner */}
      <div className="welcome-hero">
        <div className="welcome-text">
          <h2>Vanakkam, {member.name}! 📖</h2>
          <p>
            Explore our curated digital repository of classical and contemporary Tamil literature.
            Check availability, borrow instantly, manage holds, and track your reading journey.
          </p>
        </div>
        <div className="member-badge-chip">
          <span>{member.membershipTier || "Member"}</span> • <span>{member.memberId}</span>
        </div>
      </div>

      {/* useMemo Calculated Metric Cards (Requirement e) */}
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

      {/* Search & Filter Controls (Extracted components) */}
      <div className="search-filter-section">
        <SearchBar />
        <FilterPanel />
      </div>

      {/* Recommendations Section */}
      <Recommendations />

      {/* Book Catalog (Rendered via BookList with Context consumption) */}
      <div className="catalog-header">
        <h2>Tamil Book Catalog</h2>
        <span className="catalog-count-pill">Showing results</span>
      </div>

      <BookList />
    </div>
  );
}

export default Home;
