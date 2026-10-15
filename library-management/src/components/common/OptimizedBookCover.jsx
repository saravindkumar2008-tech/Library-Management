import React, { useState, useEffect, useRef } from "react";

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
 * Performance-optimized responsive book cover with lazy loading, IntersectionObserver support,
 * skeleton placeholder, zero layout shift (aspect-ratio preservation), and full accessibility.
 */
export function OptimizedBookCover({
  book,
  size = "md",
  className = "",
  showBadge = true,
  showText = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  const theme = CATEGORY_THEMES[book?.category] || DEFAULT_THEME;
  const title = book?.title || "Untitled Book";
  const author = book?.author || "Unknown Author";
  const imageUrl = book?.coverImage || book?.coverUrl || book?.imageUrl;
  const hasExternalImage = Boolean(imageUrl) && !imageError;

  // IntersectionObserver for viewport-aware image lazy loading
  useEffect(() => {
    if (!hasExternalImage) return;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "250px" } // Preload 250px before entering viewport
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [hasExternalImage, imageUrl]);

  const sizeClasses = {
    sm: "book-cover-sm",
    md: "book-cover-md",
    lg: "book-cover-lg"
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      ref={containerRef}
      className={`optimized-book-cover ${selectedSizeClass} ${className}`.trim()}
      role="img"
      aria-label={`Book cover illustration for ${title} by ${author}`}
      style={{
        background: theme.bg,
        aspectRatio: "2 / 3",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.22)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: size === "sm" ? "10px" : size === "lg" ? "20px" : "14px",
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
          width: "9px",
          background: "linear-gradient(to right, rgba(0,0,0,0.4), rgba(255,255,255,0.22), transparent)",
          zIndex: 4,
          pointerEvents: "none"
        }}
      />

      {/* External Image with Lazy Loading & Decoding */}
      {hasExternalImage && (isVisible || imageLoaded) ? (
        <>
          {!imageLoaded && (
            <div
              className="cover-skeleton-shimmer"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.05) 75%)",
                backgroundSize: "200% 100%",
                animation: "skeletonShimmer 1.5s infinite",
                zIndex: 1
              }}
            />
          )}
          <img
            src={imageUrl}
            alt={`Cover art for ${title}`}
            loading="lazy"
            decoding="async"
            width={size === "sm" ? 120 : size === "lg" ? 320 : 200}
            height={size === "sm" ? 180 : size === "lg" ? 480 : 300}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.35s ease-in-out",
              zIndex: 2
            }}
          />

          {/* Vignette overlay for external images so text and badges are legible */}
          {imageLoaded && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.7) 100%)",
                zIndex: 3,
                pointerEvents: "none"
              }}
            />
          )}
        </>
      ) : null}

      {/* Header Motif & Category Badge */}
      <div
        className="cover-header-decor"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 5 }}
      >
        <span
          className="cover-motif-icon"
          aria-hidden="true"
          style={{
            fontSize: size === "sm" ? "1.2rem" : size === "lg" ? "2.0rem" : "1.6rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.6)"
          }}
        >
          {theme.icon}
        </span>
        {showBadge && (
          <span
            className="cover-category-pill"
            style={{
              fontSize: size === "sm" ? "0.68rem" : "0.78rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "2px 8px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(6px)",
              color: theme.accent,
              border: "1px solid rgba(255, 255, 255, 0.25)",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)"
            }}
          >
            {theme.badge}
          </span>
        )}
      </div>

      {/* Center Motif Artwork: Shown when external image is not yet loaded or absent */}
      {(!hasExternalImage || !imageLoaded) && (
        <div
          className="cover-center-content"
          aria-hidden={!showText}
          style={{
            margin: "auto 0",
            textAlign: "center",
            zIndex: 4,
            textShadow: "0 2px 6px rgba(0, 0, 0, 0.7)"
          }}
        >
          <div
            className="cover-art-ornament"
            aria-hidden="true"
            style={{
              width: "48px",
              height: "2px",
              background: "rgba(255, 255, 255, 0.45)",
              margin: "0 auto 10px auto"
            }}
          />

          <div
            className="cover-center-graphic"
            aria-hidden="true"
            style={{
              fontSize: size === "sm" ? "2rem" : size === "lg" ? "3.2rem" : "2.6rem",
              opacity: 0.95,
              marginBottom: "6px"
            }}
          >
            📖
          </div>

          {showText && (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Footer subtle accent */}
      <div
        className="cover-footer-meta"
        aria-hidden="true"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.7rem",
          opacity: 0.85,
          zIndex: 5,
          textShadow: "0 1px 3px rgba(0,0,0,0.8)"
        }}
      >
        <span style={{ fontWeight: 500, letterSpacing: "0.2px" }}>
          {size === "sm" ? "Heritage" : "Tamil Heritage Collection"}
        </span>
        <span style={{ color: "#fbbf24" }}>★ ★ ★ ★ ★</span>
      </div>
    </div>
  );
}

export default OptimizedBookCover;
