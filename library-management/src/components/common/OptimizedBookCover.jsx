import React, { useState } from "react";

/**
 * Category-based rich gradient color palettes & motif patterns
 */
const CATEGORY_THEMES = {
  "Historical Fiction": {
    bg: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)",
    accent: "#fef3c7",
    icon: "🏛️",
    badge: "History"
  },
  "Philosophy & Ethics": {
    bg: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)",
    accent: "#dbeafe",
    icon: "📜",
    badge: "Philosophy"
  },
  "Epic Fiction": {
    bg: "linear-gradient(135deg, #831843 0%, #db2777 50%, #f472b6 100%)",
    accent: "#fce7f3",
    icon: "⚔️",
    badge: "Epic"
  },
  "Science Fiction": {
    bg: "linear-gradient(135deg, #0f172a 0%, #0891b2 50%, #06b6d4 100%)",
    accent: "#cffafe",
    icon: "🚀",
    badge: "Sci-Fi"
  },
  "Folk Literature": {
    bg: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)",
    accent: "#dcfce7",
    icon: "🌾",
    badge: "Folk"
  },
  "Classic Literature": {
    bg: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)",
    accent: "#ede9fe",
    icon: "👑",
    badge: "Classic"
  }
};

const DEFAULT_THEME = {
  bg: "linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #9ca3af 100%)",
  accent: "#f3f4f6",
  icon: "📖",
  badge: "Book"
};

/**
 * OptimizedBookCover Component
 * Performance-optimized responsive book cover with lazy loading, skeleton placeholder,
 * zero layout shift (aspect-ratio preservation), and full accessibility.
 */
export function OptimizedBookCover({
  book,
  size = "md",
  className = "",
  showBadge = true
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const theme = CATEGORY_THEMES[book?.category] || DEFAULT_THEME;
  const title = book?.title || "Untitled Book";
  const author = book?.author || "Unknown Author";
  const hasExternalImage = Boolean(book?.coverUrl || book?.imageUrl) && !imageError;

  const sizeClasses = {
    sm: "book-cover-sm",
    md: "book-cover-md",
    lg: "book-cover-lg"
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`optimized-book-cover ${selectedSizeClass} ${className}`.trim()}
      role="img"
      aria-label={`Book cover: ${title} by ${author}, ${book?.category || "Literature"}`}
      style={{
        background: theme.bg,
        aspectRatio: "2 / 3",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: size === "sm" ? "8px" : size === "lg" ? "20px" : "14px",
        color: "#ffffff"
      }}
    >
      {/* Decorative Book Spine Edge Effect */}
      <div
        className="book-spine-shine"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "8px",
          background: "linear-gradient(to right, rgba(0,0,0,0.35), rgba(255,255,255,0.15), transparent)",
          zIndex: 2
        }}
      />

      {/* External Image with Lazy Loading & Decoding (if provided) */}
      {hasExternalImage ? (
        <>
          {!imageLoaded && (
            <div
              className="cover-skeleton-shimmer"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 255, 255, 0.1)",
                animation: "pulse 1.5s infinite ease-in-out"
              }}
            />
          )}
          <img
            src={book.coverUrl || book.imageUrl}
            alt={`Cover art for ${title}`}
            loading="lazy"
            decoding="async"
            width={size === "sm" ? 100 : size === "lg" ? 280 : 180}
            height={size === "sm" ? 150 : size === "lg" ? 420 : 270}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
              zIndex: 1
            }}
          />
        </>
      ) : null}

      {/* Vector/Geometric Stylized Book Cover Art (Zero network payload, instant paint) */}
      <div
        className="cover-header-decor"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 3 }}
      >
        <span
          className="cover-motif-icon"
          aria-hidden="true"
          style={{ fontSize: size === "sm" ? "1.2rem" : size === "lg" ? "2rem" : "1.6rem" }}
        >
          {theme.icon}
        </span>
        {showBadge && (
          <span
            className="cover-category-pill"
            style={{
              fontSize: size === "sm" ? "0.65rem" : "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "2px 8px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(4px)",
              color: theme.accent,
              border: `1px solid rgba(255, 255, 255, 0.2)`
            }}
          >
            {theme.badge}
          </span>
        )}
      </div>

      <div
        className="cover-center-content"
        style={{
          margin: "auto 0",
          textAlign: "center",
          zIndex: 3,
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)"
        }}
      >
        <div
          className="cover-art-ornament"
          aria-hidden="true"
          style={{
            width: "40px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.5)",
            margin: "0 auto 8px auto"
          }}
        />
        <h4
          className="cover-book-title"
          style={{
            fontSize: size === "sm" ? "0.85rem" : size === "lg" ? "1.35rem" : "1.05rem",
            fontWeight: 700,
            lineHeight: 1.25,
            margin: "0 0 4px 0",
            color: "#ffffff"
          }}
        >
          {title}
        </h4>
        <p
          className="cover-book-author"
          style={{
            fontSize: size === "sm" ? "0.7rem" : "0.82rem",
            margin: 0,
            color: theme.accent,
            opacity: 0.95
          }}
        >
          {author}
        </p>
      </div>

      <div
        className="cover-footer-meta"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: size === "sm" ? "0.65rem" : "0.72rem",
          opacity: 0.85,
          zIndex: 3
        }}
      >
        <span>{book?.year ? `${book.year}` : ""}</span>
        <span>{book?.rating ? `⭐ ${book.rating}` : ""}</span>
      </div>
    </div>
  );
}

export default OptimizedBookCover;
