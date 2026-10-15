import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";
import useOnlineStatus from "./hooks/useOnlineStatus";

import Header from "./components/Header";
import Home from "./components/Home";
import Footer from "./components/Footer";
import PageLoadingFallback from "./components/common/PageLoadingFallback";

// Requirement a & b: Lazy loading & code splitting for book details and member pages
const BookDetailPage = lazy(() => import("./components/BookDetailPage"));
const BorrowRequestPage = lazy(() => import("./components/BorrowRequestPage"));
const BorrowConfirmationPage = lazy(() => import("./components/BorrowConfirmationPage"));
const MemberDashboard = lazy(() => import("./components/MemberDashboard"));
const MemberOverview = lazy(() => import("./components/MemberOverview"));
const BorrowedBooks = lazy(() => import("./components/BorrowedBooks"));
const ReadingHistory = lazy(() => import("./components/ReadingHistory"));
const Recommendations = lazy(() => import("./components/Recommendations"));
const Profile = lazy(() => import("./components/Profile"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));

// Reusable Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Button from "./components/Button";
import RestApiInspector from "./components/RestApiInspector";
import ReduxActionInspector from "./components/ReduxActionInspector";
import TokenInspector from "./components/TokenInspector";

// Redux Toolkit Global Store
import { Provider } from "react-redux";
import store from "./store";

import "./App.css";

/**
 * CrashTester Component
 * Enables live testing of the ErrorBoundary component by throwing an intentional render error
 */
function CrashTester() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("Demonstration rendering error: ErrorBoundary caught this runtime issue successfully!");
  }

  return (
    <div className="empty-box" style={{ maxWidth: "600px", margin: "40px auto" }}>
      <div className="empty-icon">🧪</div>
      <h2>ErrorBoundary Interactive Tester</h2>
      <p>
        Click the button below to simulate an unexpected React rendering error.
        The <code>ErrorBoundary</code> component will catch the error and display its fallback UI.
      </p>
      <div style={{ marginTop: "20px" }}>
        <Button
          variant="danger"
          size="lg"
          onClick={() => setShouldCrash(true)}
          icon="💥"
        >
          Simulate Rendering Crash
        </Button>
      </div>
    </div>
  );
}

/**
 * Main Layout & Routes
 */
function LibraryLayout() {
  const { operationFeedback } = useLibrary();
  const isOnline = useOnlineStatus();

  return (
    <div className="app">
      {/* Requirement e: Accessible Skip Link for Keyboard & Screen Reader Users */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>

      {/* Requirement d: PWA Offline Connectivity Banner */}
      {!isOnline && (
        <div
          className="offline-status-banner"
          role="status"
          aria-live="polite"
          style={{
            background: "linear-gradient(90deg, #d97706, #b45309)",
            color: "#ffffff",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "0.88rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            zIndex: 1000
          }}
        >
          <span aria-hidden="true">⚡</span>
          <span>Offline Mode: Operating from local service worker cache. Changes will sync when reconnected.</span>
        </div>
      )}

      {/* Header with Link and NavLink navigation */}
      <Header />

      {/* Global Toast Notification for Library Operations */}
      {operationFeedback && (
        <div
          className={`toast-notification toast-${operationFeedback.type}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-icon">
            {operationFeedback.type === "success"
              ? "✓"
              : operationFeedback.type === "error"
                ? "⚠️"
                : "ℹ️"}
          </span>
          <span className="toast-message">{operationFeedback.message}</span>
        </div>
      )}

      {/* Requirement e: Semantic Main Landmark with accessible ID and focus target */}
      <main id="main-content" className="container" tabIndex="-1">
        <ErrorBoundary>
          {/* Requirement a: Suspense wrapper for lazy-loaded routes */}
          <Suspense fallback={<PageLoadingFallback message="Loading library page..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Home />} />
              <Route path="/book/:id" element={<BookDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/error-test" element={<CrashTester />} />

              {/* Protected Routes */}
              <Route
                path="/borrowed"
                element={
                  <ProtectedRoute>
                    <BorrowedBooks />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <ReadingHistory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Complete Borrowing Flow Pages (Protected) */}
              <Route
                path="/book/:id/borrow"
                element={
                  <ProtectedRoute>
                    <BorrowRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/borrow-request/:id"
                element={
                  <ProtectedRoute>
                    <BorrowRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/borrow-confirmation/:id"
                element={
                  <ProtectedRoute>
                    <BorrowConfirmationPage />
                  </ProtectedRoute>
                }
              />

              {/* Nested Routing for Member Dashboard (Protected) */}
              <Route
                path="/member"
                element={
                  <ProtectedRoute>
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<MemberOverview />} />
                <Route path="borrowed" element={<BorrowedBooks />} />
                <Route path="history" element={<ReadingHistory />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Real-time REST API Network Inspector */}
      <RestApiInspector />

      {/* Real-time Redux Toolkit Middleware Monitor */}
      <ReduxActionInspector />

      {/* Token Lifecycle Inspector */}
      <TokenInspector />

      <Footer />
    </div>
  );
}

/**
 * Root App wrapped in Redux Provider, BrowserRouter, AuthProvider, and LibraryProvider
 */
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <LibraryProvider>
              <LibraryLayout />
            </LibraryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

export default App;