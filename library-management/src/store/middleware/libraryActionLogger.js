/**
 * Redux Toolkit Middleware: libraryActionLogger
 * Requirement d: Use middleware to monitor library actions.
 * Intercepts every dispatched library action, records execution metrics,
 * logs action payloads and state transitions, and pushes to live action monitor.
 */

class ActionMonitorHub {
  constructor() {
    this.logs = [];
    this.listeners = new Set();
    this.maxLogs = 30;
  }

  record(entry) {
    const logItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      type: entry.type,
      payload: entry.payload,
      meta: entry.meta || {},
      durationMs: entry.durationMs || 0,
      prevState: entry.prevState,
      nextState: entry.nextState
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
    this.listeners.forEach((fn) => {
      try {
        fn(this.logs);
      } catch (e) {
        console.error("Error notifying ActionMonitorHub listener:", e);
      }
    });
  }
}

export const actionMonitorHub = new ActionMonitorHub();

/**
 * Redux Middleware implementation
 */
export const libraryActionLogger = (storeAPI) => (next) => (action) => {
  const startTime = performance.now();
  const prevState = storeAPI.getState();

  // Process the action through the reducer chain
  const result = next(action);

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  const nextState = storeAPI.getState();

  // Monitor actions under library domain or async thunks
  if (typeof action.type === "string" && action.type.startsWith("library/")) {
    console.groupCollapsed(
      `%c[Redux Middleware] %c${action.type} %c(${durationMs}ms)`,
      "color: #38bdf8; font-weight: bold;",
      "color: #f59e0b; font-weight: bold;",
      "color: #94a3b8; font-weight: normal;"
    );
    console.log("%cAction Payload:", "color: #10b981; font-weight: bold;", action.payload);
    console.log("%cPrevious State:", "color: #94a3b8; font-weight: bold;", prevState.library);
    console.log("%cNext State:", "color: #3b82f6; font-weight: bold;", nextState.library);
    console.groupEnd();

    actionMonitorHub.record({
      type: action.type,
      payload: action.payload,
      durationMs,
      prevState: {
        borrowedCount: prevState.library?.borrowedBooks?.length || 0,
        historyCount: prevState.library?.readingHistory?.length || 0,
        holdsCount: prevState.library?.holdRequests?.length || 0
      },
      nextState: {
        borrowedCount: nextState.library?.borrowedBooks?.length || 0,
        historyCount: nextState.library?.readingHistory?.length || 0,
        holdsCount: nextState.library?.holdRequests?.length || 0
      }
    });
  }

  return result;
};
