import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

function Header() {
  const { borrowedBooks, overdueBooks, holdRequests, member } = useLibrary();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const overdueCount = overdueBooks.length;
  const borrowedCount = borrowedBooks.length;
  const holdCount = holdRequests.length;

  const activeUser = currentUser || member;

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* b) Use Link component to navigate to Home without reloading */}
        <Link to="/" className="logo-brand" aria-label="AK Tamil Library - Return to Home">
          <span className="logo-icon" aria-hidden="true">📚</span>
          <div className="logo-text">
            <span className="brand-name">AK Tamil Library</span>
            <span className="brand-sub">Book Search & Borrow Management</span>
          </div>
        </Link>

        {/* b) Use NavLink components to navigate between pages with active state */}
        <nav className="nav-links" aria-label="Primary site navigation">
          <NavLink
            to="/books"
            className={({ isActive }) =>
              `nav-btn ${isActive ? "active" : ""}`
            }
          >
            Catalog
          </NavLink>

          <NavLink
            to="/borrowed"
            className={({ isActive }) =>
              `nav-btn ${isActive ? "active" : ""}`
            }
          >
            Borrowed Books
            {borrowedCount > 0 && (
              <span className={`nav-badge ${overdueCount > 0 ? "badge-alert" : ""}`}>
                {borrowedCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `nav-btn ${isActive ? "active" : ""}`
            }
          >
            Reading History
          </NavLink>

          <NavLink
            to="/member"
            end
            className={({ isActive }) =>
              `nav-btn ${isActive ? "active" : ""}`
            }
          >
            Dashboard
            {holdCount > 0 && <span className="nav-badge badge-hold">{holdCount}</span>}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-btn ${isActive ? "active" : ""}`
            }
          >
            Profile & Stats
          </NavLink>

          {isAuthenticated ? (
            <div className="header-auth-group">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `nav-btn nav-btn-user ${isActive ? "active" : ""}`
                }
                title={`Signed in as ${activeUser?.name || "Member"}`}
              >
                👤 {activeUser?.name ? activeUser.name.split(" ")[0] : "Member"}
              </NavLink>
              <button
                type="button"
                className="btn-logout-header"
                onClick={handleLogout}
                title="Sign out of your session"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-btn nav-btn-user nav-btn-signin ${isActive ? "active" : ""}`
              }
            >
              🔐 Sign In
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
