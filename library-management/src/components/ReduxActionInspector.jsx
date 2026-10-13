import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actionMonitorHub } from "../store/middleware/libraryActionLogger";
import {
  borrowBook,
  returnBook,
  renewBook,
  placeHold,
  resetStore
} from "../store/librarySlice";

/**
 * ReduxActionInspector Component
 * Real-time Redux Toolkit Middleware Action Monitor & Store Inspector.
 * Demonstrates Experiment 2 Topics:
 * a) Global library store
 * b) State management (books, borrowed, member, history)
 * c) Borrow, return, renew, and hold actions
 * d) Middleware monitoring library actions
 * e) Storage synchronization (redux_library_store)
 */
export function ReduxActionInspector() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  // Read current Redux Store state
  const { books, borrowedBooks, readingHistory, holdRequests, member, lastSyncedAt } = useSelector(
    (state) => state.library
  );

  useEffect(() => {
    setLogs(actionMonitorHub.getLogs());
    const unsub = actionMonitorHub.subscribe((newLogs) => {
      setLogs([...newLogs]);
    });
    return unsub;
  }, []);

  const handleTestBorrow = () => {
    const firstAvail = books.find((b) => b.available);
    if (firstAvail) {
      dispatch(borrowBook({ bookId: firstAvail.id, durationDays: 14, notes: "Redux test loan" }));
    } else {
      alert("All books are currently borrowed! Try returning a book first.");
    }
  };

  const handleTestReturn = () => {
    if (borrowedBooks.length > 0) {
      dispatch(returnBook({ bookId: borrowedBooks[0].id, rating: 5, notes: "Redux test return" }));
    } else {
      alert("No books are currently borrowed! Try borrowing a book first.");
    }
  };

  const handleTestRenew = () => {
    if (borrowedBooks.length > 0) {
      dispatch(renewBook({ bookId: borrowedBooks[0].id, extensionDays: 7, reason: "Redux test renewal" }));
    } else {
      alert("No books currently borrowed to renew.");
    }
  };

  const handleTestHold = () => {
    const firstUnavail = books.find((b) => !b.available);
    if (firstUnavail) {
      dispatch(placeHold({ bookId: firstUnavail.id, notes: "Redux priority hold" }));
    } else if (books.length > 0) {
      dispatch(placeHold({ bookId: books[0].id, notes: "Redux reservation hold" }));
    }
  };

  return (
    <div className={`redux-inspector-dock ${isOpen ? "open" : "collapsed"}`}>
      <div className="redux-toggle-bar" onClick={() => setIsOpen(!isOpen)}>
        <div className="redux-toggle-left">
          <span className="redux-pulse-icon">🔄</span>
          <strong>Redux Toolkit Store & Middleware</strong>
          <span className="redux-tag">Active</span>
          <span className="redux-loans-badge">
            Borrowed: {borrowedBooks.length} | History: {readingHistory.length}
          </span>
        </div>
        <div className="redux-toggle-right">
          <span className="redux-toggle-btn">{isOpen ? "▼ Hide Redux Monitor" : "▲ Show Redux Monitor"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="redux-inspector-content">
          {/* Summary Strip */}
          <div className="redux-state-strip">
            <div className="redux-stat-pill">
              <span className="pill-label">Total Books:</span>
              <span className="pill-value">{books.length}</span>
            </div>
            <div className="redux-stat-pill">
              <span className="pill-label">Active Borrowed:</span>
              <span className="pill-value text-info">{borrowedBooks.length}</span>
            </div>
            <div className="redux-stat-pill">
              <span className="pill-label">Reading History:</span>
              <span className="pill-value text-success">{readingHistory.length}</span>
            </div>
            <div className="redux-stat-pill">
              <span className="pill-label">Active Holds:</span>
              <span className="pill-value text-warning">{holdRequests.length}</span>
            </div>
            <div className="redux-stat-pill">
              <span className="pill-label">Storage Synced:</span>
              <span className="pill-value" style={{ color: "#34d399", fontSize: "11px" }}>
                ✓ localStorage
              </span>
            </div>
          </div>

          {/* Quick Action Dispatches for Demo */}
          <div className="redux-action-bar">
            <span className="bar-title">Dispatch Redux Actions:</span>
            <button type="button" className="btn-redux-action" onClick={handleTestBorrow} title="Dispatch library/borrowBook">
              + Borrow Book
            </button>
            <button type="button" className="btn-redux-action" onClick={handleTestReturn} title="Dispatch library/returnBook">
              ↩ Return Book
            </button>
            <button type="button" className="btn-redux-action" onClick={handleTestRenew} title="Dispatch library/renewBook">
              ⏱ Renew (+7d)
            </button>
            <button type="button" className="btn-redux-action" onClick={handleTestHold} title="Dispatch library/placeHold">
              ⏳ Place Hold
            </button>
            <button type="button" className="btn-redux-action btn-danger" onClick={() => dispatch(resetStore())} title="Reset store to initial catalog">
              🔄 Reset Store
            </button>
          </div>

          {/* Middleware Activity Log */}
          <div className="redux-logs-section">
            <div className="redux-logs-header">
              <span>📡 Middleware Activity Log (Logged via <code>libraryActionLogger</code>):</span>
              <button
                type="button"
                className="btn-clear-logs"
                onClick={() => actionMonitorHub.clearLogs()}
              >
                Clear Log
              </button>
            </div>

            <div className="redux-logs-list">
              {logs.length === 0 ? (
                <p className="no-redux-logs">No Redux actions dispatched yet. Click action buttons above or interact with the app to monitor middleware.</p>
              ) : (
                <table className="redux-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action Type</th>
                      <th>Payload</th>
                      <th>Duration</th>
                      <th>State Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="log-time">{log.timestamp}</td>
                        <td className="action-type-col">
                          <code>{log.type}</code>
                        </td>
                        <td className="payload-col" title={JSON.stringify(log.payload)}>
                          {log.payload ? JSON.stringify(log.payload) : "none"}
                        </td>
                        <td className="duration-col">{log.durationMs}ms</td>
                        <td className="diff-col">
                          Loans: {log.prevState?.borrowedCount} → {log.nextState?.borrowedCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReduxActionInspector;
