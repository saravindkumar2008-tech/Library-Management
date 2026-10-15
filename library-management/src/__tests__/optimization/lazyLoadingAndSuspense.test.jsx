/**
 * Lazy Loading, Web Book Search & React Suspense Test Suite
 */
import React, { Suspense } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OptimizedBookCover from "../../components/common/OptimizedBookCover";
import { BookCardSkeleton, BookGridSkeleton, WebSearchSkeleton, DashboardTabSkeleton } from "../../components/common/Skeletons";
import { webBookService } from "../../services/webBookService";
import WebBookSearchModal from "../../components/WebBookSearchModal";
import SearchBar from "../../components/SearchBar";

// Mock LibraryContext
jest.mock("../../context/LibraryContext", () => ({
  useLibrary: () => ({
    search: "",
    setSearch: jest.fn(),
    books: [
      {
        id: 101,
        title: "Ponniyin Selvan",
        author: "Kalki Krishnamurthy",
        category: "Historical Fiction",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
        available: true
      }
    ]
  })
}));

describe("Lazy Loading, Web Book Images & React Suspense", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Image Lazy Loading & Attributes", () => {
    const bookWithImage = {
      id: 101,
      title: "Ponniyin Selvan",
      author: "Kalki Krishnamurthy",
      category: "Historical Fiction",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"
    };

    test("OptimizedBookCover renders with loading='lazy' and decoding='async'", () => {
      render(<OptimizedBookCover book={bookWithImage} size="md" />);
      const imgs = screen.getAllByRole("img");
      const container = imgs.find((el) => el.classList.contains("optimized-book-cover"));
      const innerImg = imgs.find((el) => el.tagName === "IMG");

      expect(container).toBeInTheDocument();
      expect(innerImg).toHaveAttribute("loading", "lazy");
      expect(innerImg).toHaveAttribute("decoding", "async");
    });

    test("Maintains fixed aspect-ratio 2 / 3 for zero layout shift", () => {
      render(<OptimizedBookCover book={bookWithImage} size="sm" />);
      const imgs = screen.getAllByRole("img");
      const container = imgs.find((el) => el.classList.contains("optimized-book-cover"));
      expect(container.style.aspectRatio).toBe("2 / 3");
    });
  });

  describe("2. React Suspense Skeleton Fallbacks", () => {
    test("renders BookCardSkeleton with role='status'", () => {
      render(<BookCardSkeleton />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    test("renders BookGridSkeleton with correct number of cards", () => {
      render(<BookGridSkeleton count={4} title="Loading test books" />);
      const statuses = screen.getAllByRole("status");
      expect(statuses.length).toBeGreaterThanOrEqual(4);
    });

    test("renders WebSearchSkeleton properly", () => {
      render(<WebSearchSkeleton count={3} />);
      expect(screen.getByText(/Fetching book covers and metadata/i)).toBeInTheDocument();
    });

    test("renders DashboardTabSkeleton properly", () => {
      render(<DashboardTabSkeleton />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    test("React Suspense seamlessly falls back to skeleton before component resolves", async () => {
      const DelayedComponent = React.lazy(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  default: () => <div data-testid="resolved-content">Loaded Successfully</div>
                }),
              50
            )
          )
      );

      render(
        <Suspense fallback={<BookGridSkeleton count={2} />}>
          <DelayedComponent />
        </Suspense>
      );

      // Initially fallback skeleton is in the DOM
      expect(screen.getAllByRole("status").length).toBeGreaterThan(0);

      // Resolves to real content
      await waitFor(() => {
        expect(screen.getByTestId("resolved-content")).toBeInTheDocument();
      });
    });
  });

  describe("3. Web Book & Cover Search Service", () => {
    test("searchBooksFromWeb handles empty query gracefully", async () => {
      const results = await webBookService.searchBooksFromWeb("");
      expect(results).toEqual([]);
    });

    test("searchCoversForBook returns curated HD covers for known Tamil classics", async () => {
      const covers = await webBookService.searchCoversForBook("Ponniyin Selvan", "Kalki");
      expect(covers.length).toBeGreaterThan(0);
      expect(covers[0].url).toContain("goodreads");
    });
  });

  describe("4. WebBookSearchModal UI", () => {
    test("renders modal and allows searching", async () => {
      const handleAdd = jest.fn();
      render(
        <WebBookSearchModal
          isOpen={true}
          onClose={jest.fn()}
          onAddBook={handleAdd}
        />
      );

      expect(screen.getByText(/Search Books & Images from Web/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search title, author, or keyword/i)).toBeInTheDocument();
    });
  });

  describe("5. SearchBar with Web Search Action", () => {
    test("renders web search button when onOpenWebSearch is provided", () => {
      const onOpenWebSearch = jest.fn();
      render(
        <BrowserRouter>
          <SearchBar onOpenWebSearch={onOpenWebSearch} />
        </BrowserRouter>
      );

      const webBtn = screen.getByTitle(/Search books & covers from Open Library Web/i);
      expect(webBtn).toBeInTheDocument();
      fireEvent.click(webBtn);
      expect(onOpenWebSearch).toHaveBeenCalled();
    });
  });
});
