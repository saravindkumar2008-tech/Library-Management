import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, DEFAULT_USERS } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import Input from "./Input";
import Button from "./Button";
import {
  validateLoginIdentifier,
  validatePassword
} from "../utils/validation";

/**
 * Login Component (Controlled Components with Validation)
 * Topics: Controlled components, form validation, AuthContext, redirect on login
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, login, logout, switchAccount } = useAuth();
  const { setMember } = useLibrary();

  // Controlled component states
  const [identifier, setIdentifier] = useState(currentUser?.memberId || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Field validation error states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // e) Destination to redirect to after successful login
  const redirectTarget = location.state?.from?.pathname || "/member";

  // Validate on blur or change
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };
    if (field === "identifier") {
      const err = validateLoginIdentifier(identifier);
      if (err) newErrors.identifier = err;
      else delete newErrors.identifier;
    }
    if (field === "password") {
      const err = validatePassword(password, 4); // allow 4+ PIN/password
      if (err) newErrors.password = err;
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ identifier: true, password: true });

    // Validate all fields
    const idErr = validateLoginIdentifier(identifier);
    const pwdErr = validatePassword(password, 4);

    if (idErr || pwdErr) {
      setErrors({
        identifier: idErr,
        password: pwdErr
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = login({ identifier, password, rememberMe });
      if (result.success) {
        // Also update LibraryContext member profile
        setMember(result.user);
        setLoading(false);
        // e) After successful login, redirect the member to the requested protected page
        navigate(redirectTarget, { replace: true });
      }
    }, 400);
  };

  const handleDemoLogin = (user) => {
    switchAccount(user);
    setMember(user);
    navigate(redirectTarget, { replace: true });
  };

  const handleLogout = () => {
    logout();
    setIdentifier("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card-wrap">
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-icon">🔐</span>
            <h2>AK Library Member Access</h2>
            <p>
              Sign in with your <strong>Member ID</strong> or <strong>Email</strong> to access
              protected circulation services, reading history, and recommendations.
            </p>
          </div>

          {/* Requested protected route notice if redirected */}
          {location.state?.from && (
            <div className="protected-redirect-notice" role="alert">
              <span>🔒</span>
              <div>
                <strong>Authentication Required</strong>
                <p>
                  You must be signed in to access <code>{location.state.from.pathname}</code>.
                  Please sign in below to continue.
                </p>
              </div>
            </div>
          )}

          {/* Active Session Status */}
          {isAuthenticated && (
            <div className="current-user-banner">
              <div className="status-dot online"></div>
              <div className="session-info">
                <p className="status-label">Active Member Session:</p>
                <strong>{currentUser?.name || "Member"}</strong> ({currentUser?.memberId})
              </div>
              <div className="session-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(redirectTarget)}
                >
                  Continue →
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Controlled Component Login Form with Validation */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <Input
              label="Member ID or Email Address"
              id="login-identifier"
              name="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (touched.identifier) validateField("identifier");
              }}
              onBlur={() => handleBlur("identifier")}
              placeholder="e.g., AK-LIB-101 or member@domain.com"
              error={touched.identifier ? errors.identifier : ""}
              icon="👤"
              helperText="Accepts official Library ID (AK-LIB-XXX) or registered email."
            />

            <Input
              label="Password / PIN"
              id="login-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) validateField("password");
              }}
              onBlur={() => handleBlur("password")}
              placeholder="Enter your security password or PIN"
              error={touched.password ? errors.password : ""}
              icon="🔑"
              helperText="Minimum 4 characters or PIN."
            />

            <div className="login-extras">
              <label className="remember-wrap">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                {" "}Remember credentials on this browser
              </label>
              <button
                type="button"
                className="forgot-link-btn"
                onClick={() => alert("PIN reset instruction sent to registered email.")}
              >
                Forgot PIN?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon="🔓"
              id="btn-login-submit"
            >
              Sign In to Member Portal
            </Button>
          </form>

          {/* Quick Demo Switcher with Controlled Auto-Fill */}
          <div className="quick-switch-section">
            <p className="quick-switch-title">Quick Demo Login: Select Member Account</p>
            <div className="demo-accounts-grid">
              {DEFAULT_USERS.map((acc) => (
                <button
                  key={acc.memberId}
                  type="button"
                  className={`demo-acc-btn ${currentUser?.memberId === acc.memberId && isAuthenticated ? "active" : ""}`}
                  onClick={() => handleDemoLogin(acc)}
                  title={`Sign in as ${acc.name}`}
                >
                  <div className="demo-acc-name">
                    {acc.name} {currentUser?.memberId === acc.memberId && isAuthenticated && "✓"}
                  </div>
                  <div className="demo-acc-meta">
                    {acc.membershipTier} • {acc.memberId}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer-links">
            <Link to="/books" className="back-link">
              ← Return to Book Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
