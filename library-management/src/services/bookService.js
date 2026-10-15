import { apiClient } from "./apiClient";
import { apiCache } from "./apiCache";

export const bookService = {
  /**
   * Requirement a: Retrieve books using GET with caching & deduplication
   * GET /api/books?search={search}&category={category}&author={author}&available={available}
   */
  async fetchBooks({ search = "", category = "All", author = "All", available = "All", signal, bypassCache = false } = {}) {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (category && category !== "All") params.category = category;
    if (author && author !== "All") params.author = author;
    if (available && available !== "All") params.available = available;

    const cacheKey = apiCache.generateKey("GET", "/books", params);

    if (bypassCache) {
      const response = await apiClient.get("/books", { params, signal });
      apiCache.set(cacheKey, response.books || []);
      return response.books || [];
    }

    return apiCache.fetchWithCache(
      cacheKey,
      async () => {
        const response = await apiClient.get("/books", { params, signal });
        return response.books || [];
      },
      { ttl: 45000, staleWhileRevalidate: true }
    );
  },

  /**
   * Requirement a: Retrieve individual book details using GET with caching
   * GET /api/books/:id
   */
  async fetchBookById(id, { signal, bypassCache = false } = {}) {
    if (!id) {
      throw new Error("Book ID is required to fetch book details");
    }
    const cacheKey = apiCache.generateKey("GET", `/books/${id}`);

    if (bypassCache) {
      const response = await apiClient.get(`/books/${id}`, { signal });
      if (response && response.book) {
        apiCache.set(cacheKey, response.book);
      }
      return response.book;
    }

    return apiCache.fetchWithCache(
      cacheKey,
      async () => {
        const response = await apiClient.get(`/books/${id}`, { signal });
        return response.book;
      },
      { ttl: 60000, staleWhileRevalidate: true }
    );
  },

  /**
   * Prefetch book details into cache ahead of time (e.g. on card hover)
   */
  prefetchBook(id) {
    if (!id) return;
    const cacheKey = apiCache.generateKey("GET", `/books/${id}`);
    const existing = apiCache.get(cacheKey);
    if (!existing || existing.isStale) {
      this.fetchBookById(id).catch(() => {});
    }
  },

  /**
   * Requirement b: Add a new book using POST
   * POST /api/books
   */
  async createBook(bookData) {
    if (!bookData || !bookData.title || !bookData.author) {
      throw new Error("Book Title and Author are required to add a new book.");
    }
    const response = await apiClient.post("/books", bookData);
    apiCache.invalidate("/books");
    apiCache.invalidate("/recommendations");
    return response.book;
  },

  /**
   * Requirement c: Update book information using PUT / PATCH
   * PUT /api/books/:id or PATCH /api/books/:id
   */
  async updateBook(id, bookData) {
    if (!id) {
      throw new Error("Book ID is required for update.");
    }
    const response = await apiClient.put(`/books/${id}`, bookData);
    apiCache.invalidate(`/books/${id}`);
    apiCache.invalidate("/books");
    apiCache.invalidate("/recommendations");
    return response.book;
  },

  /**
   * Requirement d: Delete a book using DELETE
   * DELETE /api/books/:id
   */
  async deleteBook(id) {
    if (!id) {
      throw new Error("Book ID is required to delete.");
    }
    const response = await apiClient.delete(`/books/${id}`);
    apiCache.invalidate(`/books/${id}`);
    apiCache.invalidate("/books");
    apiCache.invalidate("/recommendations");
    return response;
  },

  /**
   * Requirement e: Create borrowing record using API operations
   * POST /api/borrowings
   */
  async borrowBookApi({ bookId, memberId = "AK-LIB-101", durationDays = 14, notes = "" }) {
    const response = await apiClient.post("/borrowings", {
      bookId,
      memberId,
      durationDays,
      notes
    });
    apiCache.invalidate(`/books/${bookId}`);
    apiCache.invalidate("/books");
    apiCache.invalidate("/borrowings");
    return response.borrowing;
  },

  /**
   * Requirement e: Update borrowing record (return) using API operations
   * PATCH /api/borrowings/:id/return
   */
  async returnBookApi(idOrBookId, { rating = 5, notes = "" } = {}) {
    const response = await apiClient.patch(`/borrowings/${idOrBookId}/return`, {
      rating,
      notes
    });
    apiCache.invalidate(`/books/${idOrBookId}`);
    apiCache.invalidate("/books");
    apiCache.invalidate("/borrowings");
    return response;
  },

  /**
   * Requirement e: Update borrowing record (renew) using API operations
   * PATCH /api/borrowings/:id/renew
   */
  async renewBookApi(idOrBookId, { extensionDays = 7 } = {}) {
    const response = await apiClient.patch(`/borrowings/${idOrBookId}/renew`, {
      extensionDays
    });
    apiCache.invalidate(`/books/${idOrBookId}`);
    apiCache.invalidate("/books");
    apiCache.invalidate("/borrowings");
    return response.borrowing;
  },

  /**
   * Update book availability status
   * PATCH /api/books/:id
   */
  async updateBookAvailability(id, available) {
    const response = await apiClient.patch(`/books/${id}`, { available });
    apiCache.invalidate(`/books/${id}`);
    apiCache.invalidate("/books");
    return response.book;
  },

  /**
   * API-based recommendations
   * GET /api/recommendations
   */
  async fetchRecommendations({ memberId = "AK-LIB-101", category = null, limit = 3, signal } = {}) {
    const params = { memberId, limit };
    if (category && category !== "All") {
      params.category = category;
    }

    const cacheKey = apiCache.generateKey("GET", "/recommendations", params);
    return apiCache.fetchWithCache(
      cacheKey,
      async () => {
        const response = await apiClient.get("/recommendations", { params, signal });
        return response.recommendations || [];
      },
      { ttl: 60000, staleWhileRevalidate: true }
    );
  }
};

export default bookService;
