import React from "react";
import { useLibrary } from "../context/LibraryContext";

function FilterPanel() {
  const {
    books,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    resetFilters
  } = useLibrary();

  // Extract unique authors and categories for dynamic dropdown options
  const authorsList = ["All", ...new Set(books.map((b) => b.author))];
  const categoriesList = ["All", ...new Set(books.map((b) => b.category))];

  return (
    <div className="filter-controls-row">
      <div className="filter-item">
        <label htmlFor="cat-filter">Category:</label>
        <select
          id="cat-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label htmlFor="auth-filter">Author:</label>
        <select
          id="auth-filter"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        >
          {authorsList.map((auth) => (
            <option key={auth} value={auth}>
              {auth === "All" ? "All Authors" : auth}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label htmlFor="avail-filter">Availability:</label>
        <select
          id="avail-filter"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available Only</option>
          <option value="Unavailable">Borrowed / Unavailable</option>
        </select>
      </div>

      <button className="reset-filter-btn" onClick={resetFilters}>
        Reset Filters
      </button>
    </div>
  );
}

export default FilterPanel;
