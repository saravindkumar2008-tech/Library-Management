/**
 * Mock REST API Engine
 * Simulates a full-fledged REST API server handling endpoints for Experiments 1, 2, 3 & 4:
 *  - GET    /api/books (with query filtering: search, category, author, available)
 *  - GET    /api/books/:id (individual book details, returns 404 if not found)
 *  - POST   /api/books (Create new book - Requirement b)
 *  - PUT    /api/books/:id (Update book info - Requirement c)
 *  - PATCH  /api/books/:id (Partial update book info - Requirement c)
 *  - DELETE /api/books/:id (Delete book - Requirement d)
 *  - POST   /api/borrowings (Create borrowing record - Requirement e)
 *  - PATCH  /api/borrowings/:id/return (Update borrowing to returned - Requirement e)
 *  - PATCH  /api/borrowings/:id/renew (Update borrowing renewal - Requirement e)
 *  - GET    /api/members/current and /api/members/:id
 *  - PUT    /api/members/:id (update member profile)
 *  - GET    /api/recommendations (intelligent recommendations)
 *  --- Experiment 4 Auth Endpoints ---
 *  - POST   /api/auth/login   (Requirement a — authenticate member)
 *  - POST   /api/auth/logout  (Requirement e — invalidate server session)
 *  - POST   /api/auth/refresh (Requirement f — refresh access token)
 */

import { INITIAL_BOOKS, DEFAULT_MEMBER_DATA } from "./mockData.js";
import { apiConfig, sleep } from "./apiConfig.js";

// Local storage keys
const STORAGE_BOOKS_KEY = "library_books_catalog";
const STORAGE_MEMBER_KEY = "library_member_profile";
const STORAGE_BORROWINGS_KEY = "library_borrowed_books";

function getStoredBooks() {
  try {
    const data = localStorage.getItem(STORAGE_BOOKS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const updated = parsed.map((book) => {
          const initial = INITIAL_BOOKS.find((b) => b.id === book.id || b.title === book.title);
          if (initial) {
            return {
              ...book,
              coverImage: initial.coverImage
            };
          }
          return book;
        });

        INITIAL_BOOKS.forEach((initBook) => {
          if (!updated.some((b) => b.id === initBook.id || b.title === initBook.title)) {
            updated.push(initBook);
          }
        });

        return updated;
      }
    }
  } catch (e) {
    console.warn("Could not read stored books, using defaults:", e);
  }
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

function getStoredBorrowings() {
  try {
    const data = localStorage.getItem(STORAGE_BORROWINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveStoredBorrowings(borrowings) {
  try {
    localStorage.setItem(STORAGE_BORROWINGS_KEY, JSON.stringify(borrowings));
  } catch (e) {
    console.error("Failed to save borrowings:", e);
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
    const error = new Error("Internal Server Error: 500 - Database operation failed");
    error.status = 500;
    error.response = { status: 500, statusText: "Internal Server Error", data: { error: "Database operation failed" } };
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

  // 1. GET /api/books (Retrieve books with query filters - Requirement a)
  if (method === "GET" && pathname === "/api/books") {
    const books = getStoredBooks();
    const search = (params.get("search") || "").trim().toLowerCase();
    const category = params.get("category") || "All";
    const author = params.get("author") || "All";
    const available = params.get("available") || "All";

    const filtered = books.filter((b) => {
      const matchesSearch =
        !search ||
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        (b.description && b.description.toLowerCase().includes(search));

      const matchesCategory = category === "All" || b.category.toLowerCase() === category.toLowerCase();
      const matchesAuthor = author === "All" || b.author.toLowerCase() === author.toLowerCase();

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

  // 2. POST /api/books (Add a new book - Requirement b)
  if (method === "POST" && pathname === "/api/books") {
    const body = options.data || {};
    if (!body.title || !body.author) {
      const err = new Error("Validation Error: Title and Author are required fields.");
      err.status = 400;
      err.response = { status: 400, data: { error: "Title and Author are required." } };
      throw err;
    }

    const books = getStoredBooks();
    const maxId = books.reduce((max, b) => Math.max(max, Number(b.id) || 100), 100);
    const newBook = {
      id: maxId + 1,
      title: body.title.trim(),
      author: body.author.trim(),
      category: body.category || "General Literature",
      year: Number(body.year) || new Date().getFullYear(),
      available: body.available !== undefined ? Boolean(body.available) : true,
      rating: Number(body.rating) || 4.5,
      isbn: body.isbn || `978-818468${String(maxId + 1).padStart(4, "0")}`,
      pages: Number(body.pages) || 350,
      language: body.language || "Tamil",
      coverImage: body.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      description: body.description || `Added to library catalog on ${new Date().toLocaleDateString()}.`
    };

    books.unshift(newBook);
    saveStoredBooks(books);

    return {
      status: 201,
      statusText: "Created",
      data: {
        success: true,
        message: `Book "${newBook.title}" created successfully`,
        book: newBook
      }
    };
  }

  // 3. GET /api/books/:id (individual book details - Requirement a)
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

  // 4. PUT/PATCH /api/books/:id (Update book information - Requirement c)
  if ((method === "PUT" || method === "PATCH") && bookDetailMatch) {
    const bookId = bookDetailMatch[1];
    const body = options.data || {};
    const books = getStoredBooks();
    const index = books.findIndex(
      (b) => String(b.id) === String(bookId) || String(b.id) === String(Number(bookId) - 100)
    );

    if (index === -1) {
      const err = new Error(`Book with ID #${bookId} not found`);
      err.status = 404;
      err.response = { status: 404, data: { error: `Book #${bookId} not found` } };
      throw err;
    }

    const updatedBook = {
      ...books[index],
      ...body,
      id: books[index].id // preserve ID
    };

    books[index] = updatedBook;
    saveStoredBooks(books);

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        message: `Book "${updatedBook.title}" updated successfully`,
        book: updatedBook
      }
    };
  }

  // 5. DELETE /api/books/:id (Delete a book - Requirement d)
  if (method === "DELETE" && bookDetailMatch) {
    const bookId = bookDetailMatch[1];
    const books = getStoredBooks();
    const index = books.findIndex(
      (b) => String(b.id) === String(bookId) || String(b.id) === String(Number(bookId) - 100)
    );

    if (index === -1) {
      const err = new Error(`Book with ID #${bookId} not found`);
      err.status = 404;
      err.response = { status: 404, data: { error: `Book #${bookId} not found` } };
      throw err;
    }

    const deletedBook = books[index];
    const remaining = books.filter((_, i) => i !== index);
    saveStoredBooks(remaining);

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        message: `Book "${deletedBook.title}" was permanently deleted from the catalog`,
        deletedId: deletedBook.id
      }
    };
  }

  // 6. Borrowing records API operations (Requirement e)
  // GET /api/borrowings
  if (method === "GET" && pathname === "/api/borrowings") {
    const borrowings = getStoredBorrowings();
    return {
      status: 200,
      statusText: "OK",
      data: { success: true, count: borrowings.length, borrowings }
    };
  }

  // POST /api/borrowings (Create borrowing record using POST)
  if (method === "POST" && pathname === "/api/borrowings") {
    const body = options.data || {};
    const bookId = body.bookId;
    const books = getStoredBooks();
    const bookIndex = books.findIndex((b) => String(b.id) === String(bookId));

    if (bookIndex === -1) {
      const err = new Error(`Book #${bookId} not found`);
      err.status = 404;
      throw err;
    }

    // Mark book unavailable
    books[bookIndex].available = false;
    saveStoredBooks(books);

    const borrowings = getStoredBorrowings();
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + (body.durationDays || 14) * 86400000).toISOString().split("T")[0];

    const newBorrowing = {
      id: "BRW-" + Date.now().toString(36).toUpperCase(),
      bookId: books[bookIndex].id,
      title: books[bookIndex].title,
      author: books[bookIndex].author,
      category: books[bookIndex].category,
      borrowDate: today,
      dueDate: due,
      renewalCount: 0,
      maxRenewals: 2,
      status: "active",
      notes: body.notes || "14-day standard circulation loan"
    };

    borrowings.unshift(newBorrowing);
    saveStoredBorrowings(borrowings);

    return {
      status: 201,
      statusText: "Created",
      data: {
        success: true,
        message: `Borrowing record created for "${newBorrowing.title}"`,
        borrowing: newBorrowing
      }
    };
  }

  // PATCH /api/borrowings/:id/return (Update borrowing record to returned)
  const borrowReturnMatch = pathname.match(/^\/api\/borrowings\/([^/]+)\/return$/);
  if ((method === "PATCH" || method === "PUT" || method === "POST") && borrowReturnMatch) {
    const idOrBookId = borrowReturnMatch[1];
    const borrowings = getStoredBorrowings();
    const bIndex = borrowings.findIndex(
      (b) => String(b.id) === String(idOrBookId) || String(b.bookId) === String(idOrBookId)
    );

    if (bIndex === -1) {
      const err = new Error(`Borrowing record #${idOrBookId} not found`);
      err.status = 404;
      throw err;
    }

    const item = borrowings[bIndex];
    borrowings.splice(bIndex, 1);
    saveStoredBorrowings(borrowings);

    // Restore book availability
    const books = getStoredBooks();
    const bkIdx = books.findIndex((b) => String(b.id) === String(item.bookId));
    if (bkIdx !== -1) {
      books[bkIdx].available = true;
      saveStoredBooks(books);
    }

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        message: `Book "${item.title}" successfully returned to circulation`,
        returnedId: item.id
      }
    };
  }

  // PATCH /api/borrowings/:id/renew (Update borrowing record extension)
  const borrowRenewMatch = pathname.match(/^\/api\/borrowings\/([^/]+)\/renew$/);
  if ((method === "PATCH" || method === "PUT" || method === "POST") && borrowRenewMatch) {
    const idOrBookId = borrowRenewMatch[1];
    const borrowings = getStoredBorrowings();
    const bIndex = borrowings.findIndex(
      (b) => String(b.id) === String(idOrBookId) || String(b.bookId) === String(idOrBookId)
    );

    if (bIndex === -1) {
      const err = new Error(`Borrowing record #${idOrBookId} not found`);
      err.status = 404;
      throw err;
    }

    const currentDue = new Date(borrowings[bIndex].dueDate || Date.now());
    const newDue = new Date(currentDue.getTime() + 7 * 86400000).toISOString().split("T")[0];

    borrowings[bIndex].dueDate = newDue;
    borrowings[bIndex].renewalCount = (borrowings[bIndex].renewalCount || 0) + 1;
    saveStoredBorrowings(borrowings);

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        message: `Borrowing renewed for +7 days. New due date: ${newDue}`,
        borrowing: borrowings[bIndex]
      }
    };
  }

  // 7. GET /api/members/current OR /api/members/:id
  if (method === "GET" && (pathname === "/api/members/current" || pathname.startsWith("/api/members/"))) {
    const member = getStoredMember();
    return {
      status: 200,
      statusText: "OK",
      data: { success: true, member }
    };
  }

  // 8. PUT /api/members/:id
  if (method === "PUT" && pathname.startsWith("/api/members/")) {
    const body = options.data || {};
    const currentMember = getStoredMember();
    const updated = { ...currentMember, ...body };
    saveStoredMember(updated);
    return {
      status: 200,
      statusText: "OK",
      data: { success: true, member: updated }
    };
  }

  // 9. GET /api/recommendations
  if (method === "GET" && pathname === "/api/recommendations") {
    const books = getStoredBooks();
    const member = getStoredMember();
    const requestedCat = params.get("category");
    const limit = Number(params.get("limit")) || 3;

    const targetCategory =
      requestedCat || (member.preferredCategories && member.preferredCategories[0]) || "Historical Fiction";

    let pool = books.filter((b) => b.category.toLowerCase() === targetCategory.toLowerCase());
    if (pool.length < limit) {
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

  // ========== Experiment 4: Auth Endpoints ==========

  // Requirement a: POST /api/auth/login — Authenticate member with credentials
  if (method === "POST" && pathname === "/api/auth/login") {
    const body = options.data || {};
    const cleanId = (body.identifier || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!cleanId || !password) {
      const err = new Error("Member ID/Email and Password are required.");
      err.status = 400;
      err.response = { status: 400, data: { error: "Missing credentials" } };
      throw err;
    }

    if (password.length < 4) {
      const err = new Error("Invalid credentials — authentication failed.");
      err.status = 401;
      err.response = { status: 401, data: { error: "Invalid credentials" } };
      throw err;
    }

    // Match against valid member accounts
    const validMembers = [
      {
        memberId: "AK-LIB-101",
        email: "aravind.kumar@gmail.com",
        name: "Aravind Kumar",
        role: "Member",
        membershipTier: "Gold Scholar",
        branch: "AK Central Library, Chennai",
        joinedDate: "2024-01-15",
        phone: "+91 98765 43210",
        maxBooksAllowed: 5,
        preferredCategories: ["Historical Fiction", "Epic Fiction", "Philosophy & Ethics"]
      }
    ];

    const matched = validMembers.find(
      (u) => u.email.toLowerCase() === cleanId || u.memberId.toLowerCase() === cleanId
    );

    let user;
    if (matched) {
      user = matched;
    } else {
      // Dynamic member login (any valid format)
      const isEmail = cleanId.includes("@");
      user = {
        memberId: isEmail ? "AK-LIB-999" : cleanId.toUpperCase(),
        email: isEmail ? cleanId : `${cleanId}@library.org`,
        name: isEmail
          ? cleanId.split("@")[0].replace(".", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          : `Member ${cleanId.toUpperCase()}`,
        role: "Member",
        membershipTier: "Standard Reader",
        branch: "AK Central Library, Chennai",
        joinedDate: new Date().toISOString().split("T")[0],
        maxBooksAllowed: 3,
        preferredCategories: ["Historical Fiction"]
      };
    }

    // Server-side session token (opaque, distinct from client JWT)
    const serverToken = `srv_${user.memberId}_${Date.now().toString(36)}`;

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        message: `Welcome back, ${user.name}!`,
        user,
        token: serverToken,
        expiresIn: 900 // 15 minutes in seconds
      }
    };
  }

  // Requirement e: POST /api/auth/logout — Invalidate server session
  if (method === "POST" && pathname === "/api/auth/logout") {
    // In production this would blacklist the token server-side
    return {
      status: 200,
      statusText: "OK",
      data: { success: true, message: "Logged out successfully. Session invalidated." }
    };
  }

  // Requirement f: POST /api/auth/refresh — Refresh access token
  if (method === "POST" && pathname === "/api/auth/refresh") {
    const body = options.data || {};
    if (!body.refreshToken) {
      const err = new Error("Refresh token is required.");
      err.status = 400;
      throw err;
    }
    // Server just acknowledges — client-side tokenService handles the actual refresh
    return {
      status: 200,
      statusText: "OK",
      data: { success: true, message: "Token refreshed successfully." }
    };
  }

  // Requirement c/d: Protected endpoint auth check
  // Borrowings, member profile, and hold operations require a valid Authorization header
  const isProtected =
    pathname.startsWith("/api/borrowings") ||
    pathname.startsWith("/api/members/") ||
    pathname.startsWith("/api/holds");

  if (isProtected) {
    const authHeader = options.headers?.Authorization || options.headers?.authorization || "";
    const hasToken = authHeader.startsWith("Bearer ") && authHeader.length > 30;
    if (!hasToken) {
      const err = new Error("Unauthorized — valid authentication token required for this operation.");
      err.status = 401;
      err.response = {
        status: 401,
        statusText: "Unauthorized",
        data: { error: "Missing or invalid Authorization token", code: "TOKEN_REQUIRED" }
      };
      throw err;
    }
  }

  // Fallback 404
  const error = new Error(`Endpoint ${method} ${pathname} not found`);
  error.status = 404;
  throw error;
}

