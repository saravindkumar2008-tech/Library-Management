/**
 * Native Fetch REST API Client
 * Demonstrates async data fetching using browser fetch() with error handling,
 * header configurations, AbortController support, and event hub logging.
 * Requirement c: Attaches the live JWT token to every protected API request.
 */

import { apiConfig } from "./apiConfig";
import { apiEventHub } from "./apiEventHub";
import { mockRestApiHandler } from "./mockServer";
import { getValidToken } from "./tokenService";

/**
 * Perform an asynchronous API request using Fetch
 */
export async function fetchRequest({ method = "GET", url, params, data, signal }) {
  const startTime = Date.now();
  let fullUrl = url.startsWith("/api") ? url : `${apiConfig.baseURL}${url}`;

  // Serialize query parameters
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, String(v));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Requirement c: Attach Authorization header with live JWT token
  const token = getValidToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await mockRestApiHandler(method, fullUrl, { data, signal, headers: authHeaders });
    const durationMs = Date.now() - startTime;

    apiEventHub.logRequest({
      method,
      url: fullUrl,
      engine: "fetch",
      status: res.status,
      statusText: res.statusText,
      durationMs,
      data: res.data
    });

    return res.data;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    if (error.name !== "AbortError") {
      apiEventHub.logRequest({
        method,
        url: fullUrl,
        engine: "fetch",
        status: error.status || 500,
        statusText: error.message || "Failed",
        durationMs
      });
    }
    throw error;
  }
}
