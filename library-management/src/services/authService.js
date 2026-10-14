/**
 * Auth Service — Experiment 4: Authentication & Token Management
 * Communicates with the mock /api/auth/* REST endpoints.
 *
 * Requirement a: Develop a member login using an authentication API.
 * Requirement b: Store the authentication token after successful login.
 * Requirement e: Implement logout and token removal.
 * Requirement f: Handle invalid and expired tokens.
 */

import { mockRestApiHandler } from "./mockServer";
import { storeTokens, clearTokens, getValidToken, refreshAccessToken } from "./tokenService";
import { apiConfig, sleep } from "./apiConfig";
import { apiEventHub } from "./apiEventHub";

/**
 * Requirement a: POST /api/auth/login
 * Sends credentials to the authentication API and stores the returned tokens.
 */
export async function loginApi({ identifier, password }) {
  const startTime = Date.now();
  if (apiConfig.simulatedDelay > 0) await sleep(apiConfig.simulatedDelay);

  try {
    const res = await mockRestApiHandler("POST", "/api/auth/login", {
      data: { identifier, password }
    });

    const durationMs = Date.now() - startTime;
    apiEventHub.logRequest({
      method: "POST",
      url: "/api/auth/login",
      engine: apiConfig.clientType,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      data: res.data
    });

    const { user, token } = res.data;

    // Requirement b: Store tokens in localStorage after successful login
    const tokenResult = storeTokens(user);

    return { user, accessToken: tokenResult.accessToken, meta: tokenResult.meta, serverToken: token };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    apiEventHub.logRequest({
      method: "POST",
      url: "/api/auth/login",
      engine: apiConfig.clientType,
      status: error.status || 401,
      statusText: error.message || "Unauthorized",
      durationMs
    });
    throw error;
  }
}

/**
 * Requirement e: POST /api/auth/logout
 * Calls the logout endpoint and clears all tokens from storage.
 */
export async function logoutApi() {
  const startTime = Date.now();
  try {
    const res = await mockRestApiHandler("POST", "/api/auth/logout", { data: {} });
    const durationMs = Date.now() - startTime;
    apiEventHub.logRequest({
      method: "POST",
      url: "/api/auth/logout",
      engine: apiConfig.clientType,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      data: res.data
    });
  } catch {
    // Always clear tokens even if server call fails
  }

  // Requirement e: Remove token from storage
  clearTokens();
}

/**
 * POST /api/auth/refresh
 * Refreshes the access token using the stored refresh token.
 * Throws if the refresh token is expired (requires full re-login).
 */
export async function refreshTokenApi() {
  try {
    const newToken = refreshAccessToken();
    apiEventHub.logRequest({
      method: "POST",
      url: "/api/auth/refresh",
      engine: apiConfig.clientType,
      status: 200,
      statusText: "Token Refreshed",
      durationMs: 0,
      data: { success: true }
    });
    return newToken;
  } catch (error) {
    apiEventHub.logRequest({
      method: "POST",
      url: "/api/auth/refresh",
      engine: apiConfig.clientType,
      status: 401,
      statusText: error.message || "Refresh Failed",
      durationMs: 0
    });
    throw error;
  }
}

/**
 * Requirement c: Get an Authorization header value with the current valid token.
 * Auto-refreshes expired access tokens using the refresh token.
 * Returns null if session is fully expired (re-login needed).
 */
export function getAuthHeader() {
  const token = getValidToken();
  if (!token) return null;
  return `Bearer ${token}`;
}
