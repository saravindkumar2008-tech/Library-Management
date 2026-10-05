import React from "react";

/**
 * Reusable BookStatus Badge Component
 * Displays standardized status badges with matching colors and icons
 */
export function BookStatus({ status, customLabel = null, size = "md", className = "" }) {
  let badgeClass = "badge-available";
  let defaultLabel = "Available";
  let icon = "●";

  const normalized = String(status || "").toLowerCase().trim();

  if (normalized === "available" || normalized === "in stock" || normalized === "true") {
    badgeClass = "badge-available";
    defaultLabel = "Available";
    icon = "✓";
  } else if (normalized === "overdue") {
    badgeClass = "badge-danger badge-overdue";
    defaultLabel = "Overdue";
    icon = "⚠️";
  } else if (normalized === "duesoon" || normalized === "due soon") {
    badgeClass = "badge-warning badge-duesoon";
    defaultLabel = "Due Soon";
    icon = "⏰";
  } else if (normalized === "hold" || normalized === "reserved" || normalized === "waitlist") {
    badgeClass = "badge-hold";
    defaultLabel = "On Hold";
    icon = "⏳";
  } else if (normalized === "completed" || normalized === "returned") {
    badgeClass = "badge-success";
    defaultLabel = "Completed";
    icon = "★";
  } else {
    // Borrowed / Checked Out / Unavailable
    badgeClass = "badge-borrowed";
    defaultLabel = "Checked Out";
    icon = "📖";
  }

  const label = customLabel || defaultLabel;
  const sizeClass = size === "sm" ? "badge-sm" : size === "lg" ? "badge-lg" : "";

  return (
    <span className={`status-badge ${badgeClass} ${sizeClass} ${className}`.trim()}>
      <span className="badge-bullet">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export default BookStatus;
