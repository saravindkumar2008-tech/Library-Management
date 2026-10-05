# Library Management System - React Router, Authentication & Error Handling

A modern library management web application built with **React**, **React Router v7**, and **Context API**.

---

## 📚 Experiment 3: Implement Library Navigation Using React Router

**Topics Covered:** React Router v7, Dynamic Routing, Nested Routing, `useParams`, `useNavigate`, `Outlet`, `Link`, and `NavLink`.

- **Route Configuration**:
  - `/` & `/books`: Book Catalog & Search.
  - `/book/:id`: Dynamic book details page.
  - `/borrowed`: Direct access to borrowed books.
  - `/history`: Direct access to reading history.
  - `/profile`: Member profile & analytics.
  - `/login`: Member sign-in page.
  - `/member` (nested routes): Member Dashboard (`index`, `borrowed`, `history`, `recommendations`, `profile`).
- **Dynamic Routing & `useParams()`**:
  - Displays Book Title, Author, Category, Description, Availability, Published Year, and Borrowing Status.
- **Nested Routing & `Outlet`**:
  - Renders dashboard tabs and child components via `<Outlet />`.
- **Programmatic Navigation (`useNavigate()`)**:
  - Guides user from Book Details → Borrow Request → Borrow Confirmation → Member Dashboard.

---

## 🔐 Experiment 4: Protected Library Routes with Authentication and Error Handling

**Topics Covered:** Protected Routes, Context API (`AuthContext`), Form Validation, Error Boundaries, and Reusable Components.

### Features & Implementation:

1. **Controlled Login Component (`LoginPage.jsx`)**:
   - Collects Member ID or Email and Password/PIN.
   - Live inline validation feedback with helper hints.
   - Quick-switch member accounts for testing.

2. **`AuthContext` with Context API (`AuthContext.jsx`)**:
   - Tracks `isAuthenticated`, `currentUser`, `login()`, `logout()`, `updateUserProfile()`.
   - Persists state in `localStorage`.
   - Custom hook `useAuth()` provides direct access across components.

3. **Reusable `ProtectedRoute` Component (`ProtectedRoute.jsx`)**:
   - Restricts access to `/borrowed`, `/history`, `/profile`, `/member/*`, and borrow request paths.
   - Redirects unauthenticated users to `/login` using `<Navigate to="/login" state={{ from: location }} replace />`.

4. **Redirect After Login**:
   - Preserves user destination in `location.state.from`.
   - Upon successful authentication, programmatically redirects to the requested protected page.

5. **Comprehensive Form Validation (`src/utils/validation.js`)**:
   - **Login Form**: Required fields, valid email or member ID pattern, min 4-character password/PIN.
   - **Borrow Request Form**: Borrower name, member ID format, email pattern, phone format (10-15 digits), loan duration, circulation terms agreement.
   - **Renewal Request Form**: Maximum renewals check (up to 2 loans), overdue cutoff threshold, required renewal reason (min 5 chars), terms checkbox.
   - **Profile Form**: Full name (min 3 chars), email regex, phone regex, member ID format (`AK-LIB-XXX`), branch selection.

6. **Reusable `ErrorBoundary` Component (`ErrorBoundary.jsx`)**:
   - Class component implementing `static getDerivedStateFromError` and `componentDidCatch`.
   - Displays user-friendly error card with recovery options ("Try Again", "Return Home", "Reload App").
   - Expandable technical error stack for debugging.
   - Interactive tester accessible at `/error-test`.

7. **Reusable UI Component Suite**:
   - `Button`: Multiple variants (`primary`, `secondary`, `warning`, `danger`, `outline`), sizes (`sm`, `md`, `lg`), loading spinner, and icon support.
   - `Input`: Controlled input with label, required asterisk, icon adornment, inline error message, and helper text.
   - `BookCard`: Composed using `BookStatus`, `BorrowButton`, and `Button`.
   - `BookStatus`: Universal status badge (`available`, `borrowed`, `overdue`, `dueSoon`, `hold`, `completed`).
   - `BorrowButton`: Context-aware button switching between borrow and hold.
   - `Loading`: Centered or fullscreen loading spinner with custom message.
   - `ProtectedRoute`: Authentication route guard.
   - `ErrorBoundary`: Rendering error catcher.

8. **Complete Application Flow**:
   ```
   Login (/login)
        ↓
   Home (/ or /books)
        ↓
   Book Search & Filters
        ↓
   Book Details (/book/:id)
        ↓
   Borrow / Hold Request (/borrow-request/:id) [Protected]
        ↓
   Borrow Confirmation (/borrow-confirmation/:id) [Protected]
        ↓
   Member Dashboard (/member) [Protected]
        ↓
   Borrowed Books (/member/borrowed) [Protected]
        ↓
   Renew / Return [Form Validation Modal]
        ↓
   Reading History (/member/history) [Protected]
        ↓
   Recommendations (/member/recommendations) [Protected]
   ```

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Production build
npm run build
```

Open [http://localhost:5173/](http://localhost:5173/) to view the application.
