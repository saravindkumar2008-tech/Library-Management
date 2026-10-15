import React, { Suspense } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { DashboardTabSkeleton } from "./common/Skeletons";

/**
 * MemberDashboard Layout Component
 * Implements Nested Routing with <Outlet /> for:
 * - /member (Overview)
 * - /member/borrowed
 * - /member/history
 * - /member/recommendations
 * - /member/profile
 */
function MemberDashboard() {
  const { member, borrowedBooks, holdRequests, overdueBooks } = useLibrary();

  const overdueCount = overdueBooks.length;
  const borrowedCount = borrowedBooks.length;
  const holdCount = holdRequests.length;

  return (
    <div className="member-dashboard-layout">
      {/* Top Breadcrumb */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Member Dashboard</span>
      </nav>

      {/* Dashboard Header Banner */}
      <div className="dashboard-banner">
        <div className="banner-left">
          <span className="banner-icon">🏛️</span>
          <div>
            <h1>Member Dashboard</h1>
            <p>Welcome, {member?.name || "Aravind Kumar"} ({member?.memberId || "AK-LIB-101"}) • {member?.branch || "AK Central Library"}</p>
          </div>
        </div>
        <div className="banner-badge">
          <span className="tier-pill">{member?.membershipTier || "Gold Scholar"}</span>
        </div>
      </div>

      {/* Nested Route Tabs using NavLink */}
      <div className="dashboard-tabs">
        <NavLink
          to="/member"
          end
          className={({ isActive }) =>
            `dash-tab-btn ${isActive ? "active" : ""}`
          }
        >
          <span className="tab-icon">📊</span>
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/member/borrowed"
          className={({ isActive }) =>
            `dash-tab-btn ${isActive ? "active" : ""}`
          }
        >
          <span className="tab-icon">📖</span>
          <span>Borrowed Books</span>
          {borrowedCount > 0 && (
            <span className={`tab-count-badge ${overdueCount > 0 ? "badge-danger" : ""}`}>
              {borrowedCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/member/history"
          className={({ isActive }) =>
            `dash-tab-btn ${isActive ? "active" : ""}`
          }
        >
          <span className="tab-icon">📜</span>
          <span>Reading History</span>
        </NavLink>

        <NavLink
          to="/member/recommendations"
          className={({ isActive }) =>
            `dash-tab-btn ${isActive ? "active" : ""}`
          }
        >
          <span className="tab-icon">✨</span>
          <span>Recommendations</span>
        </NavLink>

        <NavLink
          to="/member/profile"
          className={({ isActive }) =>
            `dash-tab-btn ${isActive ? "active" : ""}`
          }
        >
          <span className="tab-icon">👤</span>
          <span>Profile & Stats</span>
          {holdCount > 0 && (
            <span className="tab-count-badge badge-hold">
              {holdCount}
            </span>
          )}
        </NavLink>
      </div>

      {/* Nested Route Outlet: Displays child components with React Suspense */}
      <div className="dashboard-outlet-container">
        <Suspense fallback={<DashboardTabSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default MemberDashboard;
