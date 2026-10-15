import React from "react";

/**
 * Reusable Loading Skeleton Components for React Suspense Boundaries
 * Provides smooth animated shimmer placeholders with zero Cumulative Layout Shift (CLS).
 */

export function BookCardSkeleton() {
  return (
    <div className="book-card book-card-skeleton" role="status" aria-label="Loading book card">
      <div className="skeleton-cover-box" style={{ aspectRatio: "2 / 3", width: "100%", borderRadius: "8px", background: "var(--skeleton-bg, rgba(255,255,255,0.06))", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
        <div className="skeleton-shimmer" />
      </div>
      <div className="skeleton-line" style={{ height: "20px", width: "75%", marginBottom: "8px", borderRadius: "4px" }} />
      <div className="skeleton-line" style={{ height: "14px", width: "55%", marginBottom: "6px", borderRadius: "4px" }} />
      <div className="skeleton-line" style={{ height: "14px", width: "40%", marginBottom: "14px", borderRadius: "4px" }} />
      <div className="skeleton-actions" style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
        <div className="skeleton-line" style={{ height: "32px", flex: 1, borderRadius: "6px" }} />
        <div className="skeleton-line" style={{ height: "32px", flex: 1, borderRadius: "6px" }} />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8, title = "Loading books..." }) {
  return (
    <div className="skeleton-grid-section" role="status" aria-label={title}>
      <div className="book-list">
        {Array.from({ length: count }).map((_, idx) => (
          <BookCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

export function WebSearchSkeleton({ count = 6 }) {
  return (
    <div className="web-search-skeleton-grid" role="status" aria-label="Searching web books...">
      <div style={{ textAlign: "center", padding: "16px 0 24px 0", color: "var(--text-muted)" }}>
        <span className="api-pulse-dot" style={{ display: "inline-block", marginRight: "8px" }} />
        Fetching book covers and metadata from Open Library & Google Books...
      </div>
      <div className="web-results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="web-book-item-skeleton" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px" }}>
            <div style={{ aspectRatio: "2 / 3", width: "100%", borderRadius: "6px", background: "rgba(255,255,255,0.06)", position: "relative", overflow: "hidden", marginBottom: "10px" }}>
              <div className="skeleton-shimmer" />
            </div>
            <div className="skeleton-line" style={{ height: "16px", width: "80%", marginBottom: "6px", borderRadius: "4px" }} />
            <div className="skeleton-line" style={{ height: "12px", width: "50%", marginBottom: "10px", borderRadius: "4px" }} />
            <div className="skeleton-line" style={{ height: "30px", width: "100%", borderRadius: "6px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardTabSkeleton() {
  return (
    <div className="dashboard-tab-skeleton" style={{ padding: "24px", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }} role="status">
      <div className="skeleton-line" style={{ height: "28px", width: "30%", marginBottom: "16px", borderRadius: "6px" }} />
      <div className="skeleton-line" style={{ height: "16px", width: "60%", marginBottom: "24px", borderRadius: "4px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ height: "140px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", padding: "16px", position: "relative", overflow: "hidden" }}>
            <div className="skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
