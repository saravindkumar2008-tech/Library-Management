import React from "react";

/**
 * Reusable Loading Spinner Component
 * Displays elegant loading indicator with customizable message and size
 */
export function Loading({
  message = "Loading library resources...",
  size = "md",
  fullScreen = false,
  className = ""
}) {
  const sizeClass = size === "sm" ? "loading-sm" : size === "lg" ? "loading-lg" : "loading-md";

  const content = (
    <div className={`loading-container ${sizeClass} ${className}`.trim()}>
      <div className="spinner-ring" role="status" aria-label="loading">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen-overlay">{content}</div>;
  }

  return content;
}

export default Loading;
