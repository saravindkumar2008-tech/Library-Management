# Library Management System - REST API, React Router, Authentication & Error Handling

A modern library management web application built with **React**, **Vite**, **Axios**, **Fetch API**, **React Router v7**, and **Context API**.

---

## 🌐 Experiment 1: Develop Library Application with Book REST API

**Topics Covered:** REST API, Axios, Fetch, Async Data, Promises, Error Handling, AbortController, and Dynamic Loading States.

### Requirements & Implementations:

#### a) Fetch book and member information using REST APIs
- **Endpoints**:
  - `GET /api/books`: Asynchronously retrieves the collection of Tamil literature books.
  - `GET /api/members/current`: Asynchronously retrieves the authenticated member's profile, tier, and loan quotas.
- **Service Layer**: Decoupled in [`src/services/bookService.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/services/bookService.js) and [`src/services/memberService.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/services/memberService.js).
- **Dual HTTP Clients**: Support for both **Axios** (with request/response interceptors, auth headers, and timing metadata) and native **Fetch API** (with `res.ok` validation and `AbortController` cancellation).
- **Live Switcher**: A toolbar in the UI enables switching between Axios and Fetch on the fly.

#### b) Implement book search and category filtering
- **API Query Parameters**:
  - `GET /api/books?search={query}&category={cat}&author={author}&available={status}`
- **Debounced Asynchronous Requests**: Search queries are debounced (300ms) to prevent unnecessary network requests while the user is typing.
- **Category Filter Dropdown**: Allows filtering by literary categories (e.g., Historical Fiction, Epic Fiction, Philosophy & Ethics).
- **Author & Availability Filters**: Dynamic dropdown filters combined seamlessly with the search query.
- **Active Filters & Reset**: Includes quick reset actions to restore all filters.

#### c) Fetch individual book details dynamically
- **Endpoint**: `GET /api/books/:id`
- **Dynamic Lookup**: When navigating to `/book/:id`, [`BookDetailPage.jsx`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/components/BookDetailPage.jsx) extracts the `id` param and makes an asynchronous REST API call to fetch that specific book's details dynamically.
- **404 Handling**: If a book ID is invalid or not found, a structured 404 response is returned and rendered with a user-friendly error card and recovery options.

#### d) Handle asynchronous API requests
- **Async/Await & Promises**: Full asynchronous implementation across services, hooks, and UI layers.
- **Request Cancellation**: Uses `AbortController` to cancel in-flight requests during rapid typing or component unmounting, preventing race conditions.
- **Request Interception & Timing**: Interceptors attach Bearer tokens, calculate round-trip response duration, and record metadata.

#### e) Display loading and error states
- **Loading Indicators**:
  - Loading spinners via [`Loading.jsx`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/components/common/Loading.jsx).
  - Shimmering skeleton cards rendered while the book catalog is loading.
- **Error States & Recovery**:
  - Informative error alert cards displaying HTTP status codes and error messages.
  - Prominent **"🔄 Retry Request"** buttons to retry failed queries without reloading the page.
- **Interactive Simulation Controls**:
  - **Latency Simulation**: Select between 0ms, 400ms, 1000ms, and 2000ms delays to test loading spinners.
  - **Error Simulation**: Toggle between 200 OK, 500 Server Error, and Network Drop to test error handling and recovery.

#### f) Implement API-based recommendations
- **Endpoint**: `GET /api/recommendations?memberId={id}&category={cat}&limit={limit}`
- **Personalized Recommendations**: Analyzes the member's reading history and preferred categories to return top-matching book recommendations.
- **Recommendation Badges & Reasons**: Each recommended book displays a match score (e.g. 95%), recommendation tags (e.g. *Staff Pick*, *Trending*), and personalized rationale (e.g. *Top match for your interest in Historical Fiction*).
- **Asynchronous Refresh**: Real-time "Refresh Recommendations" button triggering an async API re-query.

#### 📡 Real-time REST API Network Inspector:
- A collapsible bottom dock (`RestApiInspector.jsx`) providing live visibility into all network traffic:
  - Timestamp, HTTP Method (`GET`, `PATCH`, `PUT`), URL, Client Engine (Axios / Fetch), HTTP Status Code, and Round-Trip Latency (ms).

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
