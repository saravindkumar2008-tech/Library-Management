import React, { createContext, useContext, useState, useEffect } from "react";

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
  },
  {
    name: "Sundari Raman",
    email: "sundari.r@heritage.org",
    memberId: "AK-LIB-204",
    phone: "+91 94441 23456",
    branch: "Madurai Heritage Branch",
    membershipTier: "Research Fellow",
    joinedDate: "2023-08-20",
    role: "Scholar"
  },
  {
    name: "Kavin Selvam",
    email: "kavin.s@student.edu",
    memberId: "AK-LIB-309",
    phone: "+91 91234 56789",
    branch: "Coimbatore Digital Commons",
    membershipTier: "Student Reader",
    joinedDate: "2025-02-10",
    role: "Student"
  }
];

/**
 * AuthProvider Component
 * Manages authentication state, login, logout, and persistent storage
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("library_auth_user");
      return savedUser ? JSON.parse(savedUser) : DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedStatus = localStorage.getItem("library_auth_status");
      // Default to true for seamless first load, or respect stored state
      return savedStatus !== null ? savedStatus === "true" : true;
    } catch {
      return true;
    }
  });

  const [authError, setAuthError] = useState(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("library_auth_status", String(isAuthenticated));
      if (currentUser) {
        localStorage.setItem("library_auth_user", JSON.stringify(currentUser));
        localStorage.setItem("library_member_profile", JSON.stringify(currentUser));
      }
    } catch (err) {
      console.error("Failed to save auth state to storage", err);
    }
  }, [isAuthenticated, currentUser]);

  /**
   * Login member with identifier (Email or Member ID) and password
   */
  const login = ({ identifier, password }) => {
    setAuthError(null);
    const cleanId = (identifier || "").trim().toLowerCase();

    // Match against known accounts or create a dynamic session
    const matched = DEFAULT_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.memberId.toLowerCase() === cleanId
    );

    let userToSet;
    if (matched) {
      userToSet = matched;
    } else {
      // Dynamic member based on input
      const isEmail = cleanId.includes("@");
      userToSet = {
        name: isEmail
          ? cleanId.split("@")[0].replace(".", " ").toUpperCase()
          : `Member ${cleanId.toUpperCase()}`,
        email: isEmail ? cleanId : `${cleanId.toLowerCase()}@library.org`,
        memberId: isEmail ? "AK-LIB-999" : cleanId.toUpperCase(),
        phone: "+91 98765 00000",
        branch: "AK Central Library, Chennai",
        membershipTier: "Standard Reader",
        joinedDate: new Date().toISOString().split("T")[0],
        role: "Member"
      };
    }

    setCurrentUser(userToSet);
    setIsAuthenticated(true);
    return { success: true, user: userToSet };
  };

  /**
   * Logout member
   */
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("library_auth_status", "false");
  };

  /**
   * Switch account directly (for testing/demo)
   */
  const switchAccount = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  /**
   * Update profile information
   */
  const updateUserProfile = (updatedData) => {
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
  };

  const value = {
    isAuthenticated,
    currentUser,
    authError,
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
