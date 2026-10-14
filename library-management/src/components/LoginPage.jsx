import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, DEFAULT_USERS } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { getTokenStatus } from "../services/tokenService";
import Input from "./Input";
import Button from "./Button";
import {
  validateLoginIdentifier,
  validatePassword
} from "../utils/validation";

/**
 * LoginPage Component — Experiment 4: Authentication & Token Management
 *
 * Requirement a: Member login using authentication API (POST /api/auth/login)
 * Requirement b: Token displayed + stored after successful login
 * Requirement d: Shows access-restricted notice when redirected from protected route
 * Requirement e: Logout button calls API + clears tokens
 * Requirement f: Displays token error states (expired, invalid, missing)
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, authError, authLoading, login, logout, switchAccount, setAuthError } = useAuth();
  const { setMember } = useLibrary();

  // Controlled component states
  const [identifier, setIdentifier] = useState(currentUser?.memberId || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Field validation error states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Token status for live display (Requirement b, f)
  const [tokenStatus, setTokenStatus] = useState(() => getTokenStatus());

  // Refresh token status display on mount + after login/logout
  useEffect(() => {
    setTokenStatus(getTokenStatus());
  }, [isAuthenticated]);

  const redirectTarget = location.state?.from?.pathname || "/member";
  const expiredRedirect = location.state?.reason === "TOKEN_EXPIRED";
  const unauthorizedRedirect = location.state?.reason === "UNAUTHORIZED";

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
      const err = validatePassword(password, 4);
      if (err) newErrors.password = err;
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  /**
   * Requirement a: Submit credentials to the authentication API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });
    setAuthError(null);

    const idErr = validateLoginIdentifier(identifier);
    const pwdErr = validatePassword(password, 4);
    if (idErr || pwdErr) {
      setErrors({ identifier: idErr, password: pwdErr });
      return;
    }

    // Call real login API (Requirement a)
    const result = await login({ identifier, password, rememberMe });

    if (result.success) {
      setMember(result.user);
      setTokenStatus(getTokenStatus());
      navigate(redirectTarget, { replace: true });
    }
  };

  const handleDemoLogin = async (user) => {
    // Quick-switch also goes through API flow
    const result = await login({ identifier: user.email, password: "demo1234", rememberMe: true });
    if (result.success) {
      setMember(result.user);
    } else {
      // Fallback: switchAccount (no API)
      switchAccount(user);
      setMember(user);
    }
    setTokenStatus(getTokenStatus());
    navigate(redirectTarget, { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    setIdentifier("");
    setPassword("");
    setTokenStatus(getTokenStatus());
  };

  const formatTTL = (seconds) => {
    if (!seconds) return "Expired";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
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

          {/* Requirement d: Redirect notice from protected route */}
          {location.state?.from && (
            <div className="protected-redirect-notice" role="alert">
              <span>{expiredRedirect ? "⏰" : unauthorizedRedirect ? "🚫" : "🔒"}</span>
              <div>
                <strong>
                  {expiredRedirect
                    ? "Session Expired"
                    : unauthorizedRedirect
                      ? "Access Denied"
                      : "Authentication Required"}
                </strong>
                <p>
                  {expiredRedirect
                    ? "Your session token has expired. Please sign in again to continue."
                    : unauthorizedRedirect
                      ? "You do not have permission to access this resource."
                      : `You must be signed in to access `}
                  {!expiredRedirect && !unauthorizedRedirect && (
                    <code>{location.state.from.pathname}</code>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Requirement f: Auth/Token error display */}
          {authError && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-icon">⚠️</span>
              <div>
                <strong>Authentication Error</strong>
                <p>{authError}</p>
              </div>
              <button
                className="auth-error-dismiss"
                onClick={() => setAuthError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Active Session + Token Status (Requirement b) */}
          {isAuthenticated && (
            <div className="current-user-banner">
              <div className="status-dot online"></div>
              <div className="session-info">
                <p className="status-label">Active Member Session:</p>
                <strong>{currentUser?.name || "Member"}</strong> ({currentUser?.memberId})
                {tokenStatus.accessValid && (
                  <p className="token-ttl-info">
                    🔑 Token valid · expires in <strong>{formatTTL(tokenStatus.accessTTL)}</strong>
                  </p>
                )}
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

          {/* Controlled Component Login Form */}
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
              loading={authLoading}
              icon="🔓"
              id="btn-login-submit"
            >
              Sign In to Member Portal
            </Button>
          </form>

          {/* Quick Demo Switcher */}
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
                  disabled={authLoading}
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

          {/* Requirement b: Token Info Panel */}
          <div className="token-info-panel">
            <div className="token-info-header">
              <span>🔐</span>
              <strong>Authentication Token Status</strong>
              <span className={`token-badge ${tokenStatus.accessValid ? "valid" : tokenStatus.hasToken ? "expired" : "none"}`}>
                {tokenStatus.accessValid ? "VALID" : tokenStatus.hasToken ? "EXPIRED" : "NO TOKEN"}
              </span>
            </div>

            <div className="token-info-grid">
              <div className="token-info-row">
                <span className="token-info-label">Access Token</span>
                <code className="token-info-value token-truncated">
                  {tokenStatus.accessToken || "—"}
                </code>
              </div>
              <div className="token-info-row">
                <span className="token-info-label">Member</span>
                <span className="token-info-value">
                  {tokenStatus.accessPayload?.sub || "—"}
                </span>
              </div>
              <div className="token-info-row">
                <span className="token-info-label">Role</span>
                <span className="token-info-value">
                  {tokenStatus.accessPayload?.role || "—"}
                </span>
              </div>
              <div className="token-info-row">
                <span className="token-info-label">Access Expires</span>
                <span className={`token-info-value ${tokenStatus.accessTTL < 60 && tokenStatus.accessTTL > 0 ? "token-warning" : ""}`}>
                  {tokenStatus.accessTTL > 0 ? formatTTL(tokenStatus.accessTTL) : "Expired"}
                </span>
              </div>
              <div className="token-info-row">
                <span className="token-info-label">Refresh Token</span>
                <span className={`token-info-value ${tokenStatus.refreshValid ? "token-ok" : "token-expired"}`}>
                  {tokenStatus.refreshValid
                    ? `Valid (${formatTTL(tokenStatus.refreshTTL)} remaining)`
                    : "Expired — re-login required"}
                </span>
              </div>
              <div className="token-info-row">
                <span className="token-info-label">Issued At</span>
                <span className="token-info-value">
                  {tokenStatus.meta?.issuedAt
                    ? new Date(tokenStatus.meta.issuedAt).toLocaleTimeString()
                    : "—"}
                </span>
              </div>
            </div>

            <p className="token-info-note">
              ℹ️ Tokens are stored in <code>localStorage</code> and automatically attached as{" "}
              <code>Authorization: Bearer &lt;token&gt;</code> headers on protected API requests.
            </p>
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
