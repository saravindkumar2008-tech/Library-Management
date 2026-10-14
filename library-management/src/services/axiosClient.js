/**
 * Axios REST API Client
 * Configured with baseURL, request/response interceptors, auth headers, and event logging.
 * Requirement c: Attaches the live JWT token to every protected API request.
 */

import axios from "axios";
import { apiConfig } from "./apiConfig";
import { apiEventHub } from "./apiEventHub";
import { mockRestApiHandler } from "./mockServer";
import { getValidToken } from "./tokenService";

// Create custom Axios instance
export const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// Request Interceptor: Attach live Auth token (Requirement c), Timestamp, and metadata
axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    // Requirement c: Attach the current valid JWT token (auto-refreshes if expired)
    const token = getValidToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["X-Requested-With"] = "AxiosClient";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Calculate latency and log
axiosInstance.interceptors.response.use(
  (response) => {
    const durationMs = response.config.metadata ? Date.now() - response.config.metadata.startTime : 0;
    apiEventHub.logRequest({
      method: (response.config.method || "GET").toUpperCase(),
      url: response.config.url || "/api",
      engine: "axios",
      status: response.status,
      statusText: response.statusText,
      durationMs,
      data: response.data
    });
    return response;
  },
  (error) => {
    const durationMs = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    apiEventHub.logRequest({
      method: (error.config?.method || "GET").toUpperCase(),
      url: error.config?.url || "/api",
      engine: "axios",
      status: error.response?.status || 500,
      statusText: error.response?.statusText || "Request Failed",
      durationMs,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

/**
 * Perform an asynchronous API request using Axios with resilient fallback
 */
export async function axiosRequest({ method = "GET", url, params, data, signal }) {
  const startTime = Date.now();
  let fullUrl = url.startsWith("/api") ? url : `${apiConfig.baseURL}${url}`;

  // If query parameters are provided, append them
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

  // Requirement c: Attach Authorization header to mock API handler as well
  const token = getValidToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    // If error simulation or delay is active, or dev environment mock server
    const res = await mockRestApiHandler(method, fullUrl, { data, signal, headers: authHeaders });
    const durationMs = Date.now() - startTime;

    apiEventHub.logRequest({
      method,
      url: fullUrl,
      engine: "axios",
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
        engine: "axios",
        status: error.status || 500,
        statusText: error.message || "Failed",
        durationMs
      });
    }
    throw error;
  }
}
