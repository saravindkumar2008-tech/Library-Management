import { useState, useMemo, useEffect } from "react";

const INITIAL_BOOKS = [
  {
    id: 101,
    title: "Ponniyin Selvan",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1955,
    available: true,
    description: "A monumental 5-volume historical fiction classic portraying the early life of Rajaraja Chola I and the Chola empire intrigues."
  },
  {
    id: 102,
    title: "Sivagamiyin Sabatham",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1948,
    available: true,
    description: "Set during the 7th century Pallava-Chalukya conflicts, centered around the sculptor Sivagami and King Narasimhavarman I."
  },
  {
    id: 103,
    title: "Thirukkural",
    author: "Thiruvalluvar",
    category: "Philosophy & Ethics",
    year: 300,
    available: true,
    description: "A timeless ancient masterpiece containing 1,330 couplets covering virtue (Aram), wealth (Porul), and love (Inbam)."
  },
  {
    id: 104,
    title: "Kaaval Kottam",
    author: "Su. Venkatesan",
    category: "Historical Fiction",
    year: 2008,
    available: true,
    description: "Sahitya Akademi award-winning epic novel chronicling 600 years of the history and guardianship of Madurai."
  },
  {
    id: 105,
    title: "Velpari",
    author: "Su. Venkatesan",
    category: "Epic Fiction",
    year: 2018,
    available: true,
    description: "The gripping legend of the valiant chieftain Pari, king of Parambu Nadu, defying the combined might of the three great dynasties."
  },
  {
    id: 106,
    title: "En Iniya Iyanthira",
    author: "Sujatha",
    category: "Science Fiction",
    year: 1987,
    available: true,
    description: "A pioneering Tamil sci-fi dystopian saga featuring totalitarian rule, androids, and the robot dog Jeeno."
  },
  {
    id: 107,
    title: "Parthiban Kanavu",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1943,
    available: true,
    description: "The inspiring narrative of Chola Prince Vikraman fulfilling his father King Parthiban's dream of Chola restoration."
  },
  {
    id: 108,
    title: "Gopallapurathu Makkal",
    author: "Ki. Rajanarayanan",
    category: "Folk Literature",
    year: 1989,
    available: true,
    description: "A celebrated Sahitya Akademi-winning tale of migration, folk resilience, and life in the arid Karisal country."
  },
  {
    id: 109,
    title: "Silapathikaram",
    author: "Ilango Adigal",
    category: "Classic Literature",
    year: 500,
    available: true,
    description: "One of the Five Great Epics of Tamil literature, following Kannagi's relentless quest for justice against the Pandyan king."
  },
  {
    id: 110,
    title: "Kadal Pura",
    author: "Sandilyan",
    category: "Historical Fiction",
    year: 1967,
    available: true,
    description: "An adventurous historical naval romance following the expeditions of the Chola navy across Southeast Asian waters."
  }
];

/**
 * Custom Hook: useBooks
 * Manages book catalog, title search, author search, category filtering, and availability filtering.
 */
export function useBooks(initialData = INITIAL_BOOKS) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("All");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All"); // "All" | "Available" | "Unavailable"

  // Load books and migrate IDs if needed
  useEffect(() => {
    try {
      const saved = localStorage.getItem("library_books_catalog");
      if (saved) {
        let parsed = JSON.parse(saved);
        // If old IDs (1..10), migrate them to 101..110
        if (parsed.length > 0 && parsed[0].id < 100) {
          parsed = parsed.map((b) => ({
            ...b,
            id: b.id + 100
          }));
          localStorage.setItem("library_books_catalog", JSON.stringify(parsed));
        }
        setBooks(parsed);
      } else {
        setBooks(initialData);
      }
    } catch {
      setBooks(initialData);
    }
  }, [initialData]);

  // Filtered books calculated using useMemo
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Title search (also checks author in free text search)
      const query = search.trim().toLowerCase();
      const titleMatch = !query || 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query);

      // Author filter
      const authorMatch = author === "All" || book.author === author;

      // Category filter
      const categoryMatch = category === "All" || book.category === category;

      // Availability filter
      const availabilityMatch =
        availability === "All" ||
        (availability === "Available" && book.available) ||
        (availability === "Unavailable" && !book.available);

      return titleMatch && authorMatch && categoryMatch && availabilityMatch;
    });
  }, [books, search, author, category, availability]);

  // Update a book's availability status
  const updateBookAvailability = (id, isAvailable) => {
    setBooks((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, available: isAvailable } : b));
      try {
        localStorage.setItem("library_books_catalog", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save books catalog", err);
      }
      return updated;
    });
  };

  const resetFilters = () => {
    setSearch("");
    setAuthor("All");
    setCategory("All");
    setAvailability("All");
  };

  return {
    books,
    setBooks,
    search,
    setSearch,
    author,
    setAuthor,
    category,
    setCategory,
    availability,
    setAvailability,
    filteredBooks,
    updateBookAvailability,
    resetFilters
  };
}
