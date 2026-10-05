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
    <div className="search-bar-wrap">
      <span className="search-icon"></span>
      <input
        ref={searchInputRef}
        type="text"
        className="main-search-input"
        placeholder="Search Tamil books by title, keyword, or author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <button className="clear-search-btn" onClick={() => setSearch("")}>
        </button>
      )}
    </div>
  );
}
export default SearchBar;
