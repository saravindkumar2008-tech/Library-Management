/**
 * Token Service — Experiment 4: Authentication & Token Management
 * Handles JWT-like token generation, localStorage persistence,
 * validation, expiry checking, and removal.
 *
 * Requirement b: Store the authentication token after successful login.
 * Requirement e: Implement logout and token removal.
 * Requirement f: Handle invalid and expired tokens.
 */

const TOKEN_KEY = "library_auth_token";
const REFRESH_KEY = "library_refresh_token";
const TOKEN_META_KEY = "library_token_meta";

// Token TTL: access token = 15 min demo, refresh = 60 min
const ACCESS_TTL_MS = 15 * 60 * 1000;    // 15 minutes
const REFRESH_TTL_MS = 60 * 60 * 1000;   // 60 minutes

// Event listeners for token state changes (for TokenInspector UI)
const listeners = new Set();

function notify(event, payload = {}) {
  listeners.forEach((fn) => {
    try { fn({ event, payload, timestamp: new Date().toISOString() }); } catch { /* ignore */ }
  });
}

/**
 * Subscribe to token lifecycle events.
 * Returns an unsubscribe function.
 */
export function subscribeTokenEvents(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Generate a pseudo-JWT token string.
 * Format: header.payload.signature (base64url-like, demo only)
 */
function buildToken(user, type = "access") {
  const ttl = type === "access" ? ACCESS_TTL_MS : REFRESH_TTL_MS;
  const issuedAt = Date.now();
  const expiresAt = issuedAt + ttl;

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: user.memberId,
      name: user.name,
      role: user.role || "Member",
      tier: user.membershipTier || "Standard",
      iat: Math.floor(issuedAt / 1000),
      exp: Math.floor(expiresAt / 1000),
      type
    })
  );
  // Fake HMAC-SHA256 signature using memberId + secret
  const fakeSignature = btoa(`${user.memberId}:lib_secret_2024:${expiresAt}`).replace(/=/g, "");
  return `${header}.${payload}.${fakeSignature}`;
}

/**
 * Decode token payload (without verification — demo only).
 * Returns null if token is malformed.
 */
export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired.
 * Returns true if expired or invalid.
 */
export function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

/**
 * Get remaining validity time in seconds. Returns 0 if expired.
 */
export function getTokenTTL(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;
  return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
}

/**
 * Requirement b: Persist token pair and metadata to localStorage.
 */
export function storeTokens(user) {
  const accessToken = buildToken(user, "access");
  const refreshToken = buildToken(user, "refresh");
  const meta = {
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
    memberId: user.memberId,
    name: user.name,
    role: user.role || "Member"
  };

  try {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(TOKEN_META_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error("[TokenService] Failed to persist tokens:", e);
  }

  notify("TOKEN_STORED", { accessToken, meta });
  return { accessToken, refreshToken, meta };
}

/**
 * Retrieve the stored access token (raw JWT string).
 */
export function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Retrieve the stored refresh token.
 */
export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Get stored token metadata object.
 */
export function getTokenMeta() {
  try {
    const raw = localStorage.getItem(TOKEN_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Requirement e: Clear all tokens from storage (logout).
 */
export function clearTokens() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(TOKEN_META_KEY);
  } catch { /* ignore */ }
  notify("TOKEN_CLEARED");
}

/**
 * Requirement f: Validate the access token — checks existence, format, and expiry.
 * Returns { valid, reason, payload }
 */
export function validateToken(token) {
  if (!token) {
    return { valid: false, reason: "NO_TOKEN", payload: null };
  }
  const payload = decodeToken(token);
  if (!payload) {
    return { valid: false, reason: "INVALID_FORMAT", payload: null };
  }
  if (isTokenExpired(token)) {
    const ttlSec = getTokenTTL(getRefreshToken());
    notify("TOKEN_EXPIRED", { payload, refreshAvailable: ttlSec > 0 });
    return { valid: false, reason: "EXPIRED", payload };
  }
  return { valid: true, reason: "OK", payload };
}

/**
 * Requirement b/f: Refresh the access token using the refresh token.
 * Returns new accessToken or throws if refresh token is also expired.
 */
export function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const { valid, reason, payload } = validateToken(refreshToken);

  if (!valid) {
    clearTokens();
    notify("REFRESH_FAILED", { reason });
    const err = new Error(
      reason === "EXPIRED"
        ? "Session expired. Please sign in again."
        : "Invalid session. Please sign in again."
    );
    err.code = "SESSION_EXPIRED";
    throw err;
  }

  const user = {
    memberId: payload.sub,
    name: payload.name,
    role: payload.role,
    membershipTier: payload.tier
  };
  const newAccessToken = buildToken(user, "access");
  const newMeta = {
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
    memberId: user.memberId,
    name: user.name,
    role: user.role
  };

  try {
    localStorage.setItem(TOKEN_KEY, newAccessToken);
    localStorage.setItem(TOKEN_META_KEY, JSON.stringify(newMeta));
  } catch { /* ignore */ }

  notify("TOKEN_REFRESHED", { newAccessToken, meta: newMeta });
  return newAccessToken;
}

/**
 * Get a valid access token, auto-refreshing if expired.
 * Returns null if both access and refresh tokens are invalid.
 */
export function getValidToken() {
  const access = getAccessToken();
  const { valid } = validateToken(access);
  if (valid) return access;
  try {
    return refreshAccessToken();
  } catch {
    return null;
  }
}

/**
 * Full token status snapshot (for TokenInspector UI).
 */
export function getTokenStatus() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const meta = getTokenMeta();

  const accessValidation = validateToken(accessToken);
  const refreshValidation = validateToken(refreshToken);

  return {
    hasToken: !!accessToken,
    accessToken: accessToken ? `${accessToken.substring(0, 40)}...` : null,
    accessPayload: accessValidation.payload,
    accessValid: accessValidation.valid,
    accessReason: accessValidation.reason,
    accessTTL: accessToken ? getTokenTTL(accessToken) : 0,
    refreshValid: refreshValidation.valid,
    refreshTTL: refreshToken ? getTokenTTL(refreshToken) : 0,
    meta
  };
}
