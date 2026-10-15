/**
 * Security & Sanitization Utilities
 * Implements input sanitization, XSS mitigation, secure URL validation,
 * and payload integrity checks across forms and API communications.
 */

// Characters requiring HTML entity escaping
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;"
};

/**
 * Escapes potentially dangerous HTML entities from input strings
 */
export function escapeHtml(input) {
  if (typeof input !== "string") return input;
  return input.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strips script tags, inline event handlers, and javascript: protocols
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove onload, onclick, onerror attributes
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    // Remove javascript: pseudo-protocols
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Deep sanitizes all string properties within an object or array
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validates whether a URL is safe (http, https, or relative path)
 * Prevents javascript: and data: injection attacks
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Safe relative paths
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize URL or return safe fallback
 */
export function sanitizeUrl(url, fallback = "/") {
  return isSafeUrl(url) ? url.trim() : fallback;
}

/**
 * Mask sensitive data for safe rendering (e.g. auth tokens or emails)
 */
export function maskSensitiveData(str, visibleChars = 4) {
  if (!str || typeof str !== "string") return "";
  if (str.length <= visibleChars) return "*".repeat(str.length);
  return str.slice(0, visibleChars) + "*".repeat(Math.max(4, str.length - visibleChars));
}

/**
 * Validates request payload against size limits to prevent Denial of Service
 */
export function validatePayloadSize(payload, maxBytes = 100000) {
  try {
    const size = new Blob([JSON.stringify(payload)]).size;
    return size <= maxBytes;
  } catch {
    return true;
  }
}

export default {
  escapeHtml,
  sanitizeInput,
  sanitizeObject,
  isSafeUrl,
  sanitizeUrl,
  maskSensitiveData,
  validatePayloadSize
};
