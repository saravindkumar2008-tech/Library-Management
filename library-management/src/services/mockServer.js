/**
 * Mock REST API Engine
 * Simulates a full-fledged REST API server handling endpoints:
 *  - GET   /api/books (with query filtering: search, category, author, available)
 *  - GET   /api/books/:id (individual book details, returns 404 if not found)
 *  - PATCH /api/books/:id/status (update availability)
 *  - GET   /api/members/current and /api/members/:id
 *  - PUT   /api/members/:id (update member profile)
 *  - GET   /api/recommendations (intelligent API recommendations based on user history/category)
 */

import { INITIAL_BOOKS, DEFAULT_MEMBER_DATA } from "./mockData";
import { apiConfig, sleep } from "./apiConfig";

// Local storage keys
const STORAGE_BOOKS_KEY = "library_books_catalog";
const STORAGE_MEMBER_KEY = "library_member_profile";

function getStoredBooks() {
  try {
    const data = localStorage.getItem(STORAGE_BOOKS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read stored books, using defaults:", e);
  }
  // Initialize storage
  try {
    localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(INITIAL_BOOKS));
  } catch {
    // ignore
  }
  return [...INITIAL_BOOKS];
}

function saveStoredBooks(books) {
  try {
    localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books));
  } catch (e) {
    console.error("Failed to save books to storage:", e);
  }
}

function getStoredMember() {
  try {
    const data = localStorage.getItem(STORAGE_MEMBER_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.name === "Arun Kumar" || parsed.name === "Arun") {
        parsed.name = "Aravind Kumar";
        parsed.email = "aravind.kumar@gmail.com";
        localStorage.setItem(STORAGE_MEMBER_KEY, JSON.stringify(parsed));
      }
      return { ...DEFAULT_MEMBER_DATA, ...parsed };
    }
  } catch (e) {
    console.warn("Could not read member, using defaults:", e);
  }
  return { ...DEFAULT_MEMBER_DATA };
}

function saveStoredMember(member) {
  try {
    localStorage.setItem(STORAGE_MEMBER_KEY, JSON.stringify(member));
  } catch (e) {
    console.error("Failed to save member to storage:", e);
  }
}

/**
 * Handle simulated errors if configured
 */
function checkSimulatedErrors() {
  if (apiConfig.simulateError === "NETWORK_ERROR") {
    const error = new Error("Network Error: Failed to connect to Library REST API service");
    error.name = "NetworkError";
    error.status = 0;
    throw error;
  }
  if (apiConfig.simulateError === "HTTP_500") {
    const error = new Error("Internal Server Error: 500 - Database query failed");
    error.status = 500;
    error.response = { status: 500, statusText: "Internal Server Error", data: { error: "Database query failed" } };
    throw error;
  }
}

/**
 * Mock REST API Server Dispatcher
 */
export async function mockRestApiHandler(method, path, options = {}) {
  // Apply configured delay for testing loading states
  if (apiConfig.simulatedDelay > 0) {
    await sleep(apiConfig.simulatedDelay);
  }

  // Check cancellation signal
  if (options.signal && options.signal.aborted) {
    const abortErr = new Error("The operation was aborted");
    abortErr.name = "AbortError";
    throw abortErr;
  }

  // Check error simulations
  checkSimulatedErrors();

  const urlObj = new URL(path, "http://localhost");
  const pathname = urlObj.pathname;
  const params = urlObj.searchParams;

  // 1. GET /api/books (with query filters)
  if (method === "GET" && pathname === "/api/books") {
    const books = getStoredBooks();
    const search = (params.get("search") || "").trim().toLowerCase();
    const category = params.get("category") || "All";
    const author = params.get("author") || "All";
    const available = params.get("available") || "All";

    const filtered = books.filter((b) => {
      // Search in title, author, description
      const matchesSearch =
        !search ||
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        (b.description && b.description.toLowerCase().includes(search));

      // Category filter
      const matchesCategory = category === "All" || b.category.toLowerCase() === category.toLowerCase();

      // Author filter
      const matchesAuthor = author === "All" || b.author.toLowerCase() === author.toLowerCase();

      // Availability filter
      let matchesAvail = true;
      if (available === "Available" || available === "true") {
        matchesAvail = b.available === true;
      } else if (available === "Unavailable" || available === "false") {
        matchesAvail = b.available === false;
      }

      return matchesSearch && matchesCategory && matchesAuthor && matchesAvail;
    });

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        count: filtered.length,
        total: books.length,
        filters: { search, category, author, available },
        books: filtered
      }
    };
  }

  // 2. GET /api/books/:id (individual book details)
  const bookDetailMatch = pathname.match(/^\/api\/books\/([^/]+)$/);
  if (method === "GET" && bookDetailMatch) {
    const bookId = bookDetailMatch[1];
    const books = getStoredBooks();
    const book = books.find(
      (b) => String(b.id) === String(bookId) || String(b.id) === String(Number(bookId) - 100)
    );

    if (!book) {
      const err = new Error(`Book with ID #${bookId} not found`);
      err.status = 404;
      err.response = { status: 404, statusText: "Not Found", data: { error: `Book #${bookId} not found` } };
      throw err;
    }

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        book
      }
    };
  }

  // 3. PATCH /api/books/:id/status (update availability status)
  const bookStatusMatch = pathname.match(/^\/api\/books\/([^/]+)\/status$/);
  if ((method === "PATCH" || method === "PUT") && bookStatusMatch) {
    const bookId = bookStatusMatch[1];
    const body = options.data || {};
    const books = getStoredBooks();
    const index = books.findIndex(
      (b) => String(b.id) === String(bookId) || String(b.id) === String(Number(bookId) - 100)
    );

    if (index === -1) {
      const err = new Error(`Book with ID #${bookId} not found`);
      err.status = 404;
      throw err;
    }

    books[index] = {
      ...books[index],
      available: body.available !== undefined ? body.available : books[index].available
    };
    saveStoredBooks(books);

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        book: books[index]
      }
    };
  }

  // 4. GET /api/members/current OR /api/members/:id
  if (method === "GET" && (pathname === "/api/members/current" || pathname.startsWith("/api/members/"))) {
    const member = getStoredMember();
    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        member
      }
    };
  }

  // 5. PUT /api/members/:id
  if (method === "PUT" && pathname.startsWith("/api/members/")) {
    const body = options.data || {};
    const currentMember = getStoredMember();
    const updated = { ...currentMember, ...body };
    saveStoredMember(updated);
    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        member: updated
      }
    };
  }

  // 6. GET /api/recommendations (API-based recommendations)
  if (method === "GET" && pathname === "/api/recommendations") {
    const books = getStoredBooks();
    const member = getStoredMember();
    const requestedCat = params.get("category");
    const limit = Number(params.get("limit")) || 3;

    // Recommendation logic:
    // Prefer books in requested category or member preferred categories
    const targetCategory = requestedCat || (member.preferredCategories && member.preferredCategories[0]) || "Historical Fiction";

    let pool = books.filter((b) => b.category.toLowerCase() === targetCategory.toLowerCase());
    if (pool.length < limit) {
      // Add other highly rated or available books
      const extra = books.filter((b) => b.category.toLowerCase() !== targetCategory.toLowerCase() && b.available);
      pool = [...pool, ...extra];
    }

    const recommendations = pool.slice(0, limit).map((book, idx) => ({
      ...book,
      recommendationReason:
        book.category.toLowerCase() === targetCategory.toLowerCase()
          ? `Top match for your interest in ${book.category}`
          : "Highly recommended classic in Tamil literature",
      matchScore: Math.max(85, 98 - idx * 4) + "%",
      badge: idx === 0 ? "Staff Pick" : idx === 1 ? "Trending" : "Editor's Choice"
    }));

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        targetCategory,
        count: recommendations.length,
        recommendations
      }
    };
  }

  // Fallback 404
  const error = new Error(`Endpoint ${method} ${pathname} not found`);
  error.status = 404;
  throw error;
}
