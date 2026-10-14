import React, { useState, useEffect, useRef } from "react";
import {
  subscribeTokenEvents,
  getTokenStatus,
  getTokenTTL,
  getAccessToken,
  getRefreshToken,
  decodeToken
} from "../services/tokenService";

/**
 * TokenInspector Component — Experiment 4: Authentication & Token Management
 *
 * A live floating panel that monitors:
 * Requirement b: Token storage events (TOKEN_STORED)
 * Requirement e: Token removal on logout (TOKEN_CLEARED)
 * Requirement f: Token expiry (TOKEN_EXPIRED), refresh (TOKEN_REFRESHED), failure (REFRESH_FAILED)
 *
 * Shows decoded JWT payload, TTL countdown, and event log.
 */
export function TokenInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  const [tokenStatus, setTokenStatus] = useState(() => getTokenStatus());
  const [events, setEvents] = useState([]);
  const [ttlCountdown, setTtlCountdown] = useState(0);
  const eventsEndRef = useRef(null);

  // Subscribe to token lifecycle events
  useEffect(() => {
    const unsub = subscribeTokenEvents((evt) => {
      setEvents((prev) => [
        { ...evt, id: Date.now() + Math.random() },
        ...prev.slice(0, 49)
      ]);
      // Refresh status after any event
      setTokenStatus(getTokenStatus());
    });
    return unsub;
  }, []);

  // Live TTL countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getAccessToken();
      if (token) {
        const ttl = getTokenTTL(token);
        setTtlCountdown(ttl);
        // Update full status every 5 seconds
        setTokenStatus(getTokenStatus());
      } else {
        setTtlCountdown(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll events
  useEffect(() => {
    if (activeTab === "events" && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events, activeTab]);

  const formatTTL = (seconds) => {
    if (seconds <= 0) return "Expired";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getEventIcon = (event) => {
    switch (event) {
      case "TOKEN_STORED": return "🔑";
      case "TOKEN_CLEARED": return "🗑️";
      case "TOKEN_EXPIRED": return "⏰";
      case "TOKEN_REFRESHED": return "♻️";
      case "REFRESH_FAILED": return "❌";
      default: return "ℹ️";
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case "TOKEN_STORED": return "#4ade80";
      case "TOKEN_CLEARED": return "#f87171";
      case "TOKEN_EXPIRED": return "#fbbf24";
      case "TOKEN_REFRESHED": return "#60a5fa";
      case "REFRESH_FAILED": return "#f87171";
      default: return "#94a3b8";
    }
  };

  const accessPayload = decodeToken(getAccessToken());
  const refreshPayload = decodeToken(getRefreshToken());

  const ttlPercent = accessPayload?.exp
    ? Math.max(0, Math.min(100, (ttlCountdown / (accessPayload.exp - accessPayload.iat)) * 100))
    : 0;

  const ttlColor =
    ttlCountdown > 120 ? "#4ade80"
    : ttlCountdown > 30 ? "#fbbf24"
    : ttlCountdown > 0 ? "#f87171"
    : "#6b7280";

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="token-inspector-toggle"
        onClick={() => setIsOpen((v) => !v)}
        title="Toggle Token Inspector (Experiment 4)"
        aria-label="Toggle Token Inspector"
      >
        <span className="token-inspector-icon">🔐</span>
        <span className="token-inspector-label">Exp 4</span>
        <span
          className="token-inspector-status-dot"
          style={{ background: tokenStatus.accessValid ? "#4ade80" : tokenStatus.hasToken ? "#fbbf24" : "#6b7280" }}
        />
      </button>

      {/* Slide-in Panel */}
      {isOpen && (
        <div className="token-inspector-panel" role="complementary" aria-label="Token Inspector">
          {/* Header */}
          <div className="token-inspector-header">
            <div className="ti-header-left">
              <span className="ti-header-icon">🔐</span>
              <div>
                <div className="ti-header-title">Token Inspector</div>
                <div className="ti-header-subtitle">Experiment 4 — Auth & Token Management</div>
              </div>
            </div>
            <button
              className="ti-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close token inspector"
            >
              ×
            </button>
          </div>

          {/* Token TTL Bar */}
          <div className="ti-ttl-bar-wrap">
            <div className="ti-ttl-bar-labels">
              <span>Access Token TTL</span>
              <span style={{ color: ttlColor, fontWeight: 700 }}>
                {tokenStatus.hasToken ? formatTTL(ttlCountdown) : "No Token"}
              </span>
            </div>
            <div className="ti-ttl-bar-track">
              <div
                className="ti-ttl-bar-fill"
                style={{
                  width: `${ttlPercent}%`,
                  background: ttlColor,
                  transition: "width 1s linear, background 0.3s"
                }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="ti-tabs">
            {["status", "payload", "events"].map((tab) => (
              <button
                key={tab}
                className={`ti-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "status" ? "📋 Status" : tab === "payload" ? "🔍 Payload" : `📜 Events (${events.length})`}
              </button>
            ))}
          </div>

          <div className="ti-body">
            {/* STATUS TAB */}
            {activeTab === "status" && (
              <div className="ti-status-tab">
                <div className="ti-status-grid">
                  <div className="ti-status-card" style={{ borderColor: tokenStatus.accessValid ? "#4ade80" : "#f87171" }}>
                    <div className="ti-status-card-icon">{tokenStatus.accessValid ? "✅" : "❌"}</div>
                    <div className="ti-status-card-label">Access Token</div>
                    <div className="ti-status-card-value" style={{ color: tokenStatus.accessValid ? "#4ade80" : "#f87171" }}>
                      {tokenStatus.accessReason}
                    </div>
                  </div>
                  <div className="ti-status-card" style={{ borderColor: tokenStatus.refreshValid ? "#4ade80" : "#f87171" }}>
                    <div className="ti-status-card-icon">{tokenStatus.refreshValid ? "♻️" : "❌"}</div>
                    <div className="ti-status-card-label">Refresh Token</div>
                    <div className="ti-status-card-value" style={{ color: tokenStatus.refreshValid ? "#4ade80" : "#f87171" }}>
                      {tokenStatus.refreshValid ? `${formatTTL(tokenStatus.refreshTTL)}` : "Expired"}
                    </div>
                  </div>
                </div>

                <div className="ti-detail-rows">
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Storage Key</span>
                    <code className="ti-detail-value">library_auth_token</code>
                  </div>
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Member ID</span>
                    <code className="ti-detail-value">{tokenStatus.accessPayload?.sub || "—"}</code>
                  </div>
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Role</span>
                    <code className="ti-detail-value">{tokenStatus.accessPayload?.role || "—"}</code>
                  </div>
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Tier</span>
                    <code className="ti-detail-value">{tokenStatus.accessPayload?.tier || "—"}</code>
                  </div>
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Algorithm</span>
                    <code className="ti-detail-value">HS256 (simulated)</code>
                  </div>
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Issued At</span>
                    <code className="ti-detail-value">
                      {tokenStatus.meta?.issuedAt
                        ? new Date(tokenStatus.meta.issuedAt).toLocaleTimeString()
                        : "—"}
                    </code>
                  </div>
                  <div className="ti-detail-row">
                    <span className="ti-detail-label">Expires At</span>
                    <code className="ti-detail-value">
                      {tokenStatus.meta?.expiresAt
                        ? new Date(tokenStatus.meta.expiresAt).toLocaleTimeString()
                        : "—"}
                    </code>
                  </div>
                </div>

                <div className="ti-token-raw">
                  <div className="ti-token-raw-label">Raw Token (truncated)</div>
                  <code className="ti-token-raw-value">
                    {tokenStatus.accessToken || "No token in storage"}
                  </code>
                </div>

                <div className="ti-exp4-notes">
                  <div className="ti-exp4-note">
                    <span>🔒</span>
                    <span><strong>Req c:</strong> Token auto-attached as <code>Authorization: Bearer ...</code></span>
                  </div>
                  <div className="ti-exp4-note">
                    <span>🛡️</span>
                    <span><strong>Req d:</strong> Protected routes: /borrowed, /history, /profile, /member</span>
                  </div>
                  <div className="ti-exp4-note">
                    <span>♻️</span>
                    <span><strong>Req f:</strong> Auto-refresh via refresh token before expiry</span>
                  </div>
                </div>
              </div>
            )}

            {/* PAYLOAD TAB */}
            {activeTab === "payload" && (
              <div className="ti-payload-tab">
                <div className="ti-payload-section">
                  <div className="ti-payload-title">🔑 Access Token Payload (decoded)</div>
                  {accessPayload ? (
                    <pre className="ti-payload-json">
                      {JSON.stringify(
                        {
                          ...accessPayload,
                          iat: `${accessPayload.iat} (${new Date(accessPayload.iat * 1000).toLocaleTimeString()})`,
                          exp: `${accessPayload.exp} (${new Date(accessPayload.exp * 1000).toLocaleTimeString()})`
                        },
                        null, 2
                      )}
                    </pre>
                  ) : (
                    <p className="ti-empty">No access token in storage.</p>
                  )}
                </div>
                <div className="ti-payload-section">
                  <div className="ti-payload-title">♻️ Refresh Token Payload (decoded)</div>
                  {refreshPayload ? (
                    <pre className="ti-payload-json">
                      {JSON.stringify(
                        {
                          ...refreshPayload,
                          iat: `${refreshPayload.iat} (${new Date(refreshPayload.iat * 1000).toLocaleTimeString()})`,
                          exp: `${refreshPayload.exp} (${new Date(refreshPayload.exp * 1000).toLocaleTimeString()})`
                        },
                        null, 2
                      )}
                    </pre>
                  ) : (
                    <p className="ti-empty">No refresh token in storage.</p>
                  )}
                </div>
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === "events" && (
              <div className="ti-events-tab">
                {events.length === 0 ? (
                  <div className="ti-empty-events">
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                    <p>No token events yet.</p>
                    <p style={{ color: "#64748b", fontSize: "12px" }}>
                      Login or logout to see token lifecycle events.
                    </p>
                  </div>
                ) : (
                  events.map((evt) => (
                    <div key={evt.id} className="ti-event-row" style={{ borderLeftColor: getEventColor(evt.event) }}>
                      <div className="ti-event-icon">{getEventIcon(evt.event)}</div>
                      <div className="ti-event-info">
                        <div className="ti-event-name" style={{ color: getEventColor(evt.event) }}>
                          {evt.event}
                        </div>
                        <div className="ti-event-time">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </div>
                        {evt.payload && Object.keys(evt.payload).length > 0 && (
                          <div className="ti-event-payload">
                            {evt.payload.meta?.memberId && (
                              <span className="ti-event-tag">member: {evt.payload.meta.memberId}</span>
                            )}
                            {evt.payload.reason && (
                              <span className="ti-event-tag danger">reason: {evt.payload.reason}</span>
                            )}
                            {evt.payload.refreshAvailable !== undefined && (
                              <span className="ti-event-tag">
                                refresh: {evt.payload.refreshAvailable ? "available" : "none"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={eventsEndRef} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TokenInspector;
