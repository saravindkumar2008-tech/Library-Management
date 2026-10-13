/**
 * REST API Global Configuration & State
 * Manages active HTTP client (Axios vs Fetch), latency simulation, and error simulation.
 */

// Load persisted client preference or default to "axios"
const savedEngine = typeof window !== "undefined" ? localStorage.getItem("library_api_engine") : null;
const initialEngine = savedEngine === "fetch" ? "fetch" : "axios";

export const apiConfig = {
  // Active HTTP engine: "axios" or "fetch"
  clientType: initialEngine,

  // Base URL for REST API endpoints
  baseURL: "/api",

  // Simulated network latency in milliseconds (useful to inspect loading states)
  simulatedDelay: 400,

  // Simulated error mode for testing error states (null | "NETWORK_ERROR" | "HTTP_500" | "HTTP_404")
  simulateError: null,

  // Listeners for config changes
  listeners: new Set(),

  // Set the active client engine ("axios" | "fetch")
  setClientType(type) {
    if (type === "axios" || type === "fetch") {
      this.clientType = type;
      if (typeof window !== "undefined") {
        localStorage.setItem("library_api_engine", type);
      }
      this.notify();
    }
  },

  // Set artificial delay
  setSimulatedDelay(ms) {
    this.simulatedDelay = Math.max(0, Number(ms) || 0);
    this.notify();
  },

  // Set error simulation mode
  setSimulateError(errorType) {
    this.simulateError = errorType;
    this.notify();
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn({ ...this });
      } catch (e) {
        console.error("Error in apiConfig listener", e);
      }
    });
  }
};

/**
 * Utility to pause execution for artificial delay
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
