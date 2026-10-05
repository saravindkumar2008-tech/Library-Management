import React from "react";

/**
 * Reusable Button Component
 * Supports variants: primary, secondary, danger, warning, success, outline, ghost
 * Supports sizes: sm, md, lg
 * Supports loading state with spinner and icons
 */
export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  className = "",
  id,
  title,
  fullWidth = false,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-large" : "";
  const widthClass = fullWidth ? "btn-full" : "";

  return (
    <button
      type={type}
      id={id}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={`app-btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-label="Loading">
          <span className="spinner-dot"></span>
        </span>
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      <span className="btn-text">{children}</span>
    </button>
  );
}

export default Button;
