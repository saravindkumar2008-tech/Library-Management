import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";

import Header from "./components/Header";
import Home from "./components/Home";
import BookDetailPage from "./components/BookDetailPage";
import BorrowRequestPage from "./components/BorrowRequestPage";
import BorrowConfirmationPage from "./components/BorrowConfirmationPage";
import MemberDashboard from "./components/MemberDashboard";
import MemberOverview from "./components/MemberOverview";
import BorrowedBooks from "./components/BorrowedBooks";
import ReadingHistory from "./components/ReadingHistory";
import Recommendations from "./components/Recommendations";
import Profile from "./components/Profile";
import LoginPage from "./components/LoginPage";
import NotFoundPage from "./components/NotFoundPage";
import Footer from "./components/Footer";

// Reusable Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Button from "./components/Button";
import RestApiInspector from "./components/RestApiInspector";
import ReduxActionInspector from "./components/ReduxActionInspector";
import TokenInspector from "./components/TokenInspector";

// Redux Toolkit Global Store (Experiment 2)
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

  return (
    <div className="app">
      {/* Header with Link and NavLink navigation */}
      <Header />

      {/* Global Toast Notification for Library Operations */}
      {operationFeedback && (
        <div className={`toast-notification toast-${operationFeedback.type}`}>
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

      {/* Main Content Area wrapped in ErrorBoundary */}
      <main className="container">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Home />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/error-test" element={<CrashTester />} />

            {/* Protected Routes (Requirement c & d) */}
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
        </ErrorBoundary>
      </main>

      {/* Real-time REST API Network Inspector (Experiment 1) */}
      <RestApiInspector />

      {/* Real-time Redux Toolkit Middleware Monitor (Experiment 2) */}
      <ReduxActionInspector />

      {/* Token Lifecycle Inspector (Experiment 4) */}
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