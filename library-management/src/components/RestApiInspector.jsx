import React, { useState, useEffect } from "react";
import { apiEventHub } from "../services/apiEventHub";
import { apiConfig } from "../services/apiConfig";

/**
 * RestApiInspector Component
 * Live REST API monitor demonstrating Axios and Fetch network requests in real-time.
 * Displays URL, HTTP Method, Engine, Status Code, and Round-Trip Latency (ms).
 */
export function RestApiInspector() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [engine, setEngine] = useState(apiConfig.clientType);

  useEffect(() => {
    setLogs(apiEventHub.getLogs());
    const unsubHub = apiEventHub.subscribe((newLogs) => {
      setLogs([...newLogs]);
    });
    const unsubCfg = apiConfig.subscribe((cfg) => {
      setEngine(cfg.clientType);
    });

    return () => {
      unsubHub();
      unsubCfg();
    };
  }, []);

  const handleToggleEngine = (newEngine) => {
    apiConfig.setClientType(newEngine);
  };

  return (
    <div className={`api-inspector-dock ${isOpen ? "open" : "collapsed"}`}>
      <div className="inspector-toggle-bar" onClick={() => setIsOpen(!isOpen)}>
        <div className="toggle-bar-left">
          <span className="live-pulse"></span>
          <strong>REST API Network Inspector</strong>
          <span className="engine-indicator">Engine: {engine.toUpperCase()}</span>
          <span className="log-count-tag">{logs.length} requests logged</span>
        </div>
        <div className="toggle-bar-right">
          <span className="toggle-icon">{isOpen ? "▼ Hide" : "▲ Show API Logs"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="inspector-body">
          <div className="inspector-controls">
            <div className="engine-switch-btns">
              <span>Switch Engine:</span>
              <button
                type="button"
                className={`btn-sm-engine ${engine === "axios" ? "active" : ""}`}
                onClick={() => handleToggleEngine("axios")}
              >
                Axios
              </button>
              <button
                type="button"
                className={`btn-sm-engine ${engine === "fetch" ? "active" : ""}`}
                onClick={() => handleToggleEngine("fetch")}
              >
                Fetch
              </button>
            </div>
            <button
              type="button"
              className="btn-clear-logs"
              onClick={() => apiEventHub.clearLogs()}
            >
              Clear Logs
            </button>
          </div>

          <div className="inspector-logs-table-wrap">
            {logs.length === 0 ? (
              <p className="no-logs-msg">No API requests logged yet. Browse books or perform actions to see live REST API activity.</p>
            ) : (
              <table className="inspector-logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Engine</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className={log.success ? "log-success" : "log-failure"}>
                      <td className="log-time">{log.timestamp}</td>
                      <td>
                        <span className={`method-badge method-${log.method.toLowerCase()}`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="log-url" title={log.url}>{log.url}</td>
                      <td>
                        <span className={`engine-badge engine-${log.engine}`}>
                          {log.engine}
                        </span>
                      </td>
                      <td>
                        <span className={`status-code ${log.success ? "status-ok" : "status-err"}`}>
                          {log.status} {log.statusText}
                        </span>
                      </td>
                      <td className="log-duration">{log.durationMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RestApiInspector;
