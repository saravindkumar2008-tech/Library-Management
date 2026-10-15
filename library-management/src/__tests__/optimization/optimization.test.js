/**
 * Optimization, Security, PWA & Caching Test Suite
 * Covers Requirements a, b, c, d, e, f
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { apiCache } from "../../services/apiCache";
import {
  escapeHtml,
  sanitizeInput,
  sanitizeObject,
  isSafeUrl,
  sanitizeUrl,
  maskSensitiveData,
  validatePayloadSize
} from "../../utils/security";
import OptimizedBookCover from "../../components/common/OptimizedBookCover";
import * as serviceWorkerRegistration from "../../serviceWorkerRegistration";

describe("Optimization & Performance Test Suite", () => {
  beforeEach(() => {
    apiCache.clear();
  });

  // ==========================================
  // 1. API Data Loading & Caching (Requirement c)
  // ==========================================
  describe("API Cache Service", () => {
    test("caches and returns GET data on subsequent requests", async () => {
      let networkCalls = 0;
      const fetchFn = async () => {
        networkCalls++;
        return [{ id: 101, title: "Ponniyin Selvan" }];
      };

      const key = apiCache.generateKey("GET", "/books", { category: "Historical Fiction" });

      // First call: cache miss, triggers network
      const result1 = await apiCache.fetchWithCache(key, fetchFn);
      expect(result1).toHaveLength(1);
      expect(networkCalls).toBe(1);

      // Second call: cache hit, no network call
      const result2 = await apiCache.fetchWithCache(key, fetchFn);
      expect(result2).toHaveLength(1);
      expect(networkCalls).toBe(1);
    });

    test("deduplicates concurrent in-flight requests", async () => {
      let callCount = 0;
      const delayedFetch = () =>
        new Promise((resolve) => {
          callCount++;
          setTimeout(() => resolve({ success: true }), 50);
        });

      const key = apiCache.generateKey("GET", "/books/101");

      // Fire 3 simultaneous requests for the same resource
      const [res1, res2, res3] = await Promise.all([
        apiCache.fetchWithCache(key, delayedFetch),
        apiCache.fetchWithCache(key, delayedFetch),
        apiCache.fetchWithCache(key, delayedFetch)
      ]);

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res3.success).toBe(true);
      expect(callCount).toBe(1); // Exact deduplication
    });

    test("invalidates cache when pattern matches", async () => {
      const key1 = apiCache.generateKey("GET", "/books/101");
      const key2 = apiCache.generateKey("GET", "/books");
      apiCache.set(key1, { title: "Ponniyin Selvan" });
      apiCache.set(key2, [{ id: 101 }]);

      expect(apiCache.get(key1)).not.toBeNull();
      expect(apiCache.get(key2)).not.toBeNull();

      apiCache.invalidate("/books/101");
      expect(apiCache.get(key1)).toBeNull();
      expect(apiCache.get(key2)).not.toBeNull();
    });
  });

  // ==========================================
  // 2. Image Optimization & CLS (Requirement c)
  // ==========================================
  describe("OptimizedBookCover Component", () => {
    const mockBook = {
      id: 101,
      title: "Ponniyin Selvan",
      author: "Kalki Krishnamurthy",
      category: "Historical Fiction",
      year: 1955,
      rating: 4.9
    };

    test("renders book cover with role=img and descriptive accessibility label", () => {
      render(<OptimizedBookCover book={mockBook} size="sm" />);
      const cover = screen.getByRole("img");
      expect(cover).toBeInTheDocument();
      expect(cover).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Ponniyin Selvan")
      );
    });

    test("applies fixed aspect ratio to eliminate layout shift (CLS)", () => {
      render(<OptimizedBookCover book={mockBook} size="md" />);
      const cover = screen.getByRole("img");
      expect(cover.style.aspectRatio).toBe("2 / 3");
    });
  });

  // ==========================================
  // 3. Security & Secure Input Handling (Requirement f)
  // ==========================================
  describe("Security Utilities", () => {
    test("escapes HTML entities to prevent XSS", () => {
      const unsafe = '<script>alert("xss")</script>&foo=1';
      const safe = escapeHtml(unsafe);
      expect(safe).not.toContain("<script>");
      expect(safe).toContain("&lt;script&gt;");
      expect(safe).toContain("&amp;");
    });

    test("strips script tags and inline event handlers from inputs", () => {
      const malicious = 'Hello <script>stealCookies()</script> world <img src="x" onerror="hack()" />';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("onerror=");
      expect(sanitized).toContain("Hello  world");
    });

    test("deeply sanitizes nested objects and arrays", () => {
      const taintedObj = {
        title: "<b>Good Book</b>",
        nested: {
          comment: '<script>alert("hacked")</script>Nice read!'
        },
        tags: ['<a href="javascript:alert(1)">tag1</a>', "normal"]
      };

      const cleanObj = sanitizeObject(taintedObj);
      expect(cleanObj.nested.comment).not.toContain("<script>");
      expect(cleanObj.nested.comment).toContain("Nice read!");
      expect(cleanObj.tags[0]).not.toContain("javascript:");
    });

    test("validates safe URLs and rejects dangerous protocols", () => {
      expect(isSafeUrl("/books/101")).toBe(true);
      expect(isSafeUrl("https://example.com/cover.jpg")).toBe(true);
      expect(isSafeUrl("javascript:alert(document.cookie)")).toBe(false);
      expect(isSafeUrl("data:text/html;base64,PHNjcmlwdD4=")).toBe(false);
    });

    test("sanitizeUrl falls back to safe path when given unsafe URL", () => {
      expect(sanitizeUrl("javascript:evil()", "/books")).toBe("/books");
      expect(sanitizeUrl("/safe-path", "/books")).toBe("/safe-path");
    });

    test("masks sensitive data properly", () => {
      expect(maskSensitiveData("aravind.kumar@gmail.com")).toBe("arav*******************");
      expect(maskSensitiveData("token12345")).toBe("toke******");
    });

    test("validates payload size against limits", () => {
      const smallPayload = { bookId: 101, notes: "Please reserve" };
      expect(validatePayloadSize(smallPayload, 1000)).toBe(true);

      const hugePayload = { data: "x".repeat(200000) };
      expect(validatePayloadSize(hugePayload, 50000)).toBe(false);
    });
  });

  // ==========================================
  // 4. PWA Registration (Requirement d)
  // ==========================================
  describe("PWA Service Worker Registration", () => {
    test("handles unregister gracefully", () => {
      expect(() => serviceWorkerRegistration.unregister()).not.toThrow();
    });

    test("handles register gracefully in test environments", () => {
      expect(() => serviceWorkerRegistration.register()).not.toThrow();
    });
  });
});
