import React from "react";

/**
 * PageLoadingFallback Component
 * Accessible, elegant skeleton loading placeholder for lazy-loaded routes.
 * Meets WCAG accessibility standards with role="status" and aria-live="polite".
 */
export function PageLoadingFallback({ message = "Loading page resources..." }) {
  return (
    <div
      className="page-loading-fallback"
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        padding: "40px 20px",
        maxWidth: "960px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "var(--color-primary, #2563eb)",
          fontWeight: 600
        }}
      >
        <div
          className="spinner-ring"
          aria-hidden="true"
          style={{ width: "24px", height: "24px", borderWidth: "2px" }}
        >
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span>{message}</span>
      </div>

      {/* Accessible Skeleton Placeholder Blocks */}
      <div
        className="skeleton-block header-skeleton"
        aria-hidden="true"
        style={{
          height: "40px",
          width: "60%",
          borderRadius: "8px",
          background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "skeletonShimmer 1.5s infinite"
        }}
      />

      <div
        className="skeleton-grid"
        aria-hidden="true"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
          marginTop: "10px"
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "260px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #f8fafc 25%, #edf2f7 50%, #f8fafc 75%)",
              backgroundSize: "200% 100%",
              animation: "skeletonShimmer 1.5s infinite"
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PageLoadingFallback;
