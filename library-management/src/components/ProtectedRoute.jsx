import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Reusable ProtectedRoute Component
 * Restricts access to authenticated library members.
 * Unauthenticated users are redirected to /login with original location state
 * so they can be redirected back to the requested page upon successful login.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and preserve requested location in history state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
