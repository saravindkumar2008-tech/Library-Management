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

## ⚡ Experiment 2: Implement Library State Management using Redux Toolkit or Zustand

**Topics Covered:** Redux Toolkit (`createSlice`, `configureStore`), Zustand (Alternative Store with `persist`), Custom Middleware, Browser Storage Synchronization, and Live State Monitoring.

### Requirements & Implementations:

#### a) Create a global library store
- **Store Configuration**: Implemented in [`src/store/index.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/store/index.js) using Redux Toolkit's `configureStore()`.
- **Root Reducer**: Integrates `libraryReducer` from [`src/store/librarySlice.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/store/librarySlice.js).
- **Zustand Implementation**: Equivalent store implemented in [`src/store/zustandStore.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/store/zustandStore.js) for comparative study.
- **Provider Injection**: Root `<Provider store={store}>` wraps the app in [`src/App.jsx`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/App.jsx).

#### b) Manage books, borrowed books, member information, and reading history
- **Unified Global State Slice**:
  - `books`: Catalog of 10 Tamil literature books with availability, ISBN, and metadata.
  - `borrowedBooks`: Active borrowings with loan duration, due dates, and renewal counters.
  - `member`: Identity, tier (`Gold Scholar`), branch, borrowing limits, and loan quotas.
  - `readingHistory`: Completed books with return dates, duration kept, and ratings.
  - `holdRequests`: Active book reservations when items are unavailable.

#### c) Implement borrow, return, renew, and hold actions
- **`borrowBook`**: Validates availability and maximum loan limits (5 books), marks book unavailable, sets 14-day due date, adds to `borrowedBooks`, increments member loan count, and triggers success feedback.
- **`returnBook`**: Removes from `borrowedBooks`, restores availability, records completion in `readingHistory` with days kept, decrements member loan count, and triggers feedback.
- **`renewBook`**: Checks maximum renewals limit (2), extends due date by +7 days, increments `renewalCount`, and notifies user.
- **`placeHold`**: Queues priority reservation for unavailable titles and tracks queue position.
- **`cancelHold`**: Cancels reservation holds.

#### d) Use middleware to monitor library actions
- **Custom Middleware**: [`src/store/middleware/libraryActionLogger.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/store/middleware/libraryActionLogger.js).
- Intercepts all actions starting with `library/` (`library/borrowBook`, `library/returnBook`, `library/renewBook`, `library/placeHold`).
- Calculates action execution duration (ms), logs structured colored groups in browser DevTools console, and streams live action events to the UI dock.

#### e) Synchronize state with browser storage
- **Custom Middleware**: [`src/store/middleware/storageSyncMiddleware.js`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/store/middleware/storageSyncMiddleware.js).
- Automatically persists state under `redux_library_store` on every state change.
- `loadPersistedState()` seamlessly hydrates the Redux store on application reload.

#### f) Display suitable loading and empty states
- **Loading States**: Shimmering skeleton cards and spinner rings during async catalog fetches.
- **Empty States**: Customized cards when search yields no books, when borrowed list has 0 books, or when reading history is empty.

#### 🔄 Redux Toolkit Action & Middleware Inspector:
- A collapsible bottom-left dock ([`src/components/ReduxActionInspector.jsx`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/components/ReduxActionInspector.jsx)) featuring:
  - Live state counters (Books, Borrowed, History, Holds, Storage Sync).
  - Quick action dispatchers (`+ Borrow`, `↩ Return`, `⏱ Renew`, `⏳ Hold`, `🔄 Reset`).
  - Real-time middleware activity log table showing Time, Action Type, Payload, and State Diff.

---

## 🛠️ Experiment 3: Implement Library Book and Borrowing CRUD Operations

**Topics Covered:** CRUD (Create, Read, Update, Delete), REST API, Axios / Fetch, State Synchronization, Modal Workflows, and Error States.

### Requirements & Implementations:

#### a) Retrieve books using GET
- **Endpoints**: `GET /api/books` and `GET /api/books/:id`
- Retrieves the full book catalog with search, category, author, and availability query parameters.
- Dynamically loads individual book details on `/book/:id` with HTTP 200/404 handling.

#### b) Add a new book using POST
- **Endpoint**: `POST /api/books`
- Triggered via the **`➕ Add New Book (POST API)`** button in the catalog header.
- [`BookFormModal.jsx`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/components/BookFormModal.jsx) collects book metadata (Title, Author, Category, Year, ISBN, Rating, Pages, Description).
- Dispatches HTTP `POST` via [`bookService.createBook()`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/services/bookService.js), updates Redux store (`addBook`), persists to `localStorage`, and displays success toast notification.

#### c) Update book information using PUT / PATCH
- **Endpoint**: `PUT /api/books/:id` or `PATCH /api/books/:id`
- Triggered via the **`✏️ Edit`** button on any Book Card or the Book Detail page.
- Pre-populates existing data in `BookFormModal.jsx`, sends HTTP `PUT`/`PATCH` request, updates Redux store (`updateBookInfo`), updates active loans if currently borrowed, and displays toast feedback.

#### d) Delete a book using DELETE
- **Endpoint**: `DELETE /api/books/:id`
- Triggered via the **`🗑️ Del`** button on any Book Card or the Book Detail page.
- Opens [`DeleteConfirmModal.jsx`](file:///c:/Users/sarav/OneDrive/Desktop/web%203/library-management/src/components/DeleteConfirmModal.jsx) displaying a safety warning.
- Sends HTTP `DELETE` request, removes the record from catalog and Redux store (`deleteBook`), and handles optimistic/confirmed removal.

#### e) Create and update borrowing records using API operations
- **Create Borrowing (POST)**: `POST /api/borrowings`
  - Submits loan request, marks book unavailable (`available: false`), creates an active borrowing record with a 14-day due date, and increments member loan quota.
- **Return Book (PATCH / PUT)**: `PATCH /api/borrowings/:id/return`
  - Closes the active loan, restores book availability to `true`, and appends completed record to reading history.
- **Renew Loan (PATCH / PUT)**: `PATCH /api/borrowings/:id/renew`
  - Extends loan due date by **+7 days** and increments renewal counter (up to 2 maximum renewals).

#### f) Display suitable loading and error states
- **Submit Loading States**: Buttons display animated spinners (*"Creating Book..."*, *"Updating Book..."*, *"Deleting..."*).
- **Validation Errors**: Inline error alerts for required fields (Title, Author).
- **Network & Server Errors**: Informative red alert cards with retry actions if an API operation fails.
- **Empty States**: Customized views for empty search results or empty loan records.

---

## 📚 Experiment 4: Implement Library Navigation Using React Router

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
