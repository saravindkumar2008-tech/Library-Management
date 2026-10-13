/**
 * Book Service Layer
 * Encapsulates all REST API interactions for the Tamil book catalog,
 * dynamic single-book lookups, category searches, and recommendation queries.
 */

import { apiClient } from "./apiClient";

export const bookService = {
  /**
   * Requirement a & b: Fetch books from REST API with search and category filtering
   * GET /api/books?search={search}&category={category}&author={author}&available={available}
   */
  async fetchBooks({ search = "", category = "All", author = "All", available = "All", signal } = {}) {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (category && category !== "All") params.category = category;
    if (author && author !== "All") params.author = author;
    if (available && available !== "All") params.available = available;

    const response = await apiClient.get("/books", { params, signal });
    return response.books || [];
  },

  /**
   * Requirement c: Fetch individual book details dynamically
   * GET /api/books/:id
   */
  async fetchBookById(id, { signal } = {}) {
    if (!id) {
      throw new Error("Book ID is required to fetch book details");
    }
    const response = await apiClient.get(`/books/${id}`, { signal });
    return response.book;
  },

  /**
   * Update a book's availability status via REST API
   * PATCH /api/books/:id/status
   */
  async updateBookAvailability(id, available) {
    const response = await apiClient.patch(`/books/${id}/status`, { available });
    return response.book;
  },

  /**
   * Requirement f: Implement API-based recommendations
   * GET /api/recommendations?memberId={memberId}&category={category}&limit={limit}
   */
  async fetchRecommendations({ memberId = "AK-LIB-101", category = null, limit = 3, signal } = {}) {
    const params = { memberId, limit };
    if (category && category !== "All") {
      params.category = category;
    }

    const response = await apiClient.get("/recommendations", { params, signal });
    return response.recommendations || [];
  }
};
