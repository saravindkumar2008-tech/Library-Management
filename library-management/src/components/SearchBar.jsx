import React, { useRef, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";

function SearchBar() {
  const { search, setSearch } = useLibrary();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="search-bar-wrap" role="search" aria-label="Book search form">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        id="main-search-input"
        ref={searchInputRef}
        type="search"
        className="main-search-input"
        placeholder="Search Tamil books by title, keyword, or author..."
        aria-label="Search Tamil books by title, keyword, or author"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
        spellCheck="false"
      />
      {search && (
        <button
          type="button"
          className="clear-search-btn"
          onClick={() => setSearch("")}
          aria-label="Clear search query"
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
