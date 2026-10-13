/**
 * API Event Hub
 * Records all incoming and outgoing REST API requests (Axios and Fetch)
 * for live inspection and academic demonstration.
 */

class ApiEventHub {
  constructor() {
    this.logs = [];
    this.listeners = new Set();
    this.maxLogs = 30;
  }

  logRequest(entry) {
    const logItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      method: entry.method || "GET",
      url: entry.url,
      engine: entry.engine, // "axios" | "fetch"
      status: entry.status || 200,
      statusText: entry.statusText || "OK",
      durationMs: entry.durationMs || 0,
      success: entry.status >= 200 && entry.status < 300,
      dataSize: entry.data ? JSON.stringify(entry.data).length : 0
    };

    this.logs.unshift(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notify();
    return logItem;
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.logs);
      } catch (err) {
        console.error("Error in apiEventHub listener:", err);
      }
    });
  }
}

export const apiEventHub = new ApiEventHub();
