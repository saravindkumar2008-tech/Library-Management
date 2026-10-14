import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginApi, logoutApi } from "../services/authService";
import {
  getAccessToken,
  getTokenMeta,
  validateToken,
  clearTokens,
  getTokenStatus
} from "../services/tokenService";

// Create AuthContext
export const AuthContext = createContext(null);

export const DEFAULT_USERS = [
  {
    name: "Aravind Kumar",
    email: "aravind.kumar@gmail.com",
    memberId: "AK-LIB-101",
    phone: "+91 98765 43210",
    branch: "AK Central Library, Chennai",
    membershipTier: "Gold Scholar",
    joinedDate: "2024-01-15",
    role: "Member"
  }
];

/**
 * AuthProvider Component — Experiment 4: Authentication & Token Management
 *
 * Requirement a: Member login via authentication API (POST /api/auth/login)
 * Requirement b: Token stored in localStorage via tokenService after login
 * Requirement c: Token auto-attached to all protected API requests
 * Requirement d: Protected routes redirect to /login without valid token
 * Requirement e: Logout clears all tokens (POST /api/auth/logout)
 * Requirement f: Invalid/expired tokens trigger re-login, auto-refresh on expiry
 */
export function AuthProvider({ children }) {
  // Restore user from token meta on page load (Requirement b — persistent session)
  const [currentUser, setCurrentUser] = useState(() => {
    const meta = getTokenMeta();
    const token = getAccessToken();
    const { valid } = validateToken(token);
    if (valid && meta) {
      // Restore from localStorage user profile if available
      try {
        const saved = localStorage.getItem("library_auth_user");
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
      return {
        memberId: meta.memberId,
        name: meta.name,
        role: meta.role,
        email: "",
        membershipTier: "Standard Reader"
      };
    }
    return DEFAULT_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = getAccessToken();
    const { valid } = validateToken(token);
    // If no token at all, default to true so the app loads normally (guest mode)
    // If token exists but invalid/expired, stay logged out
    if (token && !valid) return false;
    try {
      const saved = localStorage.getItem("library_auth_status");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync auth state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("library_auth_status", String(isAuthenticated));
      if (currentUser && isAuthenticated) {
        localStorage.setItem("library_auth_user", JSON.stringify(currentUser));
        localStorage.setItem("library_member_profile", JSON.stringify(currentUser));
      }
    } catch (err) {
      console.error("Failed to save auth state to storage", err);
    }
  }, [isAuthenticated, currentUser]);

  /**
   * Requirement f: Periodically validate the token and auto-logout if expired
   */
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const token = getAccessToken();
      if (!token) return;
      const { valid, reason } = validateToken(token);
      if (!valid && reason === "EXPIRED") {
        // Token expired — try to auto-refresh silently
        try {
          const status = getTokenStatus();
          if (!status.refreshValid) {
            // Refresh also expired — force logout
            setIsAuthenticated(false);
            setCurrentUser(DEFAULT_USERS[0]);
            setAuthError("Your session has expired. Please sign in again.");
          }
          // If refresh is valid, getValidToken() inside API clients will handle it
        } catch {
          setIsAuthenticated(false);
          setAuthError("Session expired. Please sign in again.");
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkTokenInterval);
  }, []);

  /**
   * Requirement a: Login via authentication API (POST /api/auth/login)
   * Requirement b: Token stored automatically by loginApi → storeTokens
   */
  const login = useCallback(async ({ identifier, password, rememberMe = true }) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { user, accessToken, meta } = await loginApi({ identifier, password });

      setCurrentUser(user);
      setIsAuthenticated(true);

      if (rememberMe) {
        try {
          localStorage.setItem("library_auth_user", JSON.stringify(user));
          localStorage.setItem("library_auth_status", "true");
        } catch { /* ignore */ }
      }

      setAuthLoading(false);
      return { success: true, user, accessToken, meta };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Login failed. Please check your credentials.";
      setAuthError(msg);
      setAuthLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Requirement e: Logout — calls API and clears all tokens
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch { /* always proceed with client-side cleanup */ }

    // Requirement e: Remove token from storage
    clearTokens();

    try {
      localStorage.removeItem("library_auth_user");
      localStorage.setItem("library_auth_status", "false");
    } catch { /* ignore */ }

    setIsAuthenticated(false);
    setCurrentUser(DEFAULT_USERS[0]);
    setAuthError(null);
  }, []);

  /**
   * Switch account directly (for demo quick-switch)
   */
  const switchAccount = useCallback((user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  /**
   * Update profile information
   */
  const updateUserProfile = useCallback((updatedData) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...updatedData };
      try {
        localStorage.setItem("library_auth_user", JSON.stringify(next));
        localStorage.setItem("library_member_profile", JSON.stringify(next));
      } catch (err) {
        console.error("Failed to update profile", err);
      }
      return next;
    });
  }, []);

  const value = {
    isAuthenticated,
    currentUser,
    authError,
    authLoading,
    setAuthError,
    login,
    logout,
    switchAccount,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom Hook: useAuth
 * Provides access to authentication status and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
