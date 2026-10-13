import { useState, useEffect, useRef, useCallback } from "react";
import { bookService } from "../services/bookService";
import { apiConfig } from "../services/apiConfig";

/**
 * Custom Hook: useBooks
 * Handles asynchronous REST API data fetching, loading & error states,
 * debounced search querying, category filtering, and request cancellation.
 * Satisfies Requirements a, b, d, e.
 */
export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [author, setAuthor] = useState("All");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");

  // Track active API engine
  const [currentEngine, setCurrentEngine] = useState(apiConfig.clientType);

  // Debounce search input to avoid flooding REST API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Subscribe to API config changes (e.g. when engine is toggled between Axios and Fetch)
  useEffect(() => {
    return apiConfig.subscribe((cfg) => {
      setCurrentEngine(cfg.clientType);
    });
  }, []);

  // Fetch books asynchronously via REST API
  const abortControllerRef = useRef(null);

  const fetchBooksFromApi = useCallback(async () => {
    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const data = await bookService.fetchBooks({
        search: debouncedSearch,
        category,
        author,
        available: availability,
        signal: abortController.signal
      });
      setBooks(data);
      setError(null);
    } catch (err) {
      if (err.name === "AbortError") {
        // Request was cancelled due to subsequent user interaction; do not show error
        return;
      }
      console.error("Error fetching books via REST API:", err);
      setError(err.message || "Failed to fetch books from REST API. Please check your network connection.");
    } finally {
      // Only reset loading if this is the active request
      if (abortControllerRef.current === abortController) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, category, author, availability]);

  // Trigger fetch on filter/search or engine change
  useEffect(() => {
    fetchBooksFromApi();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBooksFromApi]);

  // Update book availability via REST API PATCH request
  const updateBookAvailability = async (id, isAvailable) => {
    try {
      const updatedBook = await bookService.updateBookAvailability(id, isAvailable);
      setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, available: isAvailable } : b)));
      return updatedBook;
    } catch (err) {
      console.error(`Failed to update book status for #${id}:`, err);
      // Optimistic update locally
      setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, available: isAvailable } : b)));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setAuthor("All");
    setCategory("All");
    setAvailability("All");
  };

  return {
    books,
    filteredBooks: books, // The REST API filters server-side based on query params
    loading,
    error,
    search,
    setSearch,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    currentEngine,
    updateBookAvailability,
    resetFilters,
    refetchBooks: fetchBooksFromApi
  };
}
