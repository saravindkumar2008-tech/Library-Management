/**
 * Mock Data Repository for Library REST API
 * Provides structured dataset for Tamil literature catalog and member profiles.
 */

export const INITIAL_BOOKS = [
  {
    id: 101,
    title: "Ponniyin Selvan",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1955,
    available: true,
    rating: 4.9,
    isbn: "978-8184680010",
    pages: 2400,
    language: "Tamil",
    description: "A monumental 5-volume historical fiction classic portraying the early life of Rajaraja Chola I and the Chola empire intrigues."
  },
  {
    id: 102,
    title: "Sivagamiyin Sabatham",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1948,
    available: true,
    rating: 4.8,
    isbn: "978-8184680027",
    pages: 1120,
    language: "Tamil",
    description: "Set during the 7th century Pallava-Chalukya conflicts, centered around the sculptor Sivagami and King Narasimhavarman I."
  },
  {
    id: 103,
    title: "Thirukkural",
    author: "Thiruvalluvar",
    category: "Philosophy & Ethics",
    year: 300,
    available: true,
    rating: 5.0,
    isbn: "978-8184680034",
    pages: 420,
    language: "Tamil",
    description: "A timeless ancient masterpiece containing 1,330 couplets covering virtue (Aram), wealth (Porul), and love (Inbam)."
  },
  {
    id: 104,
    title: "Kaaval Kottam",
    author: "Su. Venkatesan",
    category: "Historical Fiction",
    year: 2008,
    available: true,
    rating: 4.7,
    isbn: "978-8184680041",
    pages: 1044,
    language: "Tamil",
    description: "Sahitya Akademi award-winning epic novel chronicling 600 years of the history and guardianship of Madurai."
  },
  {
    id: 105,
    title: "Velpari",
    author: "Su. Venkatesan",
    category: "Epic Fiction",
    year: 2018,
    available: true,
    rating: 4.9,
    isbn: "978-8184680058",
    pages: 1350,
    language: "Tamil",
    description: "The gripping legend of the valiant chieftain Pari, king of Parambu Nadu, defying the combined might of the three great dynasties."
  },
  {
    id: 106,
    title: "En Iniya Iyanthira",
    author: "Sujatha",
    category: "Science Fiction",
    year: 1987,
    available: true,
    rating: 4.6,
    isbn: "978-8184680065",
    pages: 310,
    language: "Tamil",
    description: "A pioneering Tamil sci-fi dystopian saga featuring totalitarian rule, androids, and the robot dog Jeeno."
  },
  {
    id: 107,
    title: "Parthiban Kanavu",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1943,
    available: true,
    rating: 4.7,
    isbn: "978-8184680072",
    pages: 380,
    language: "Tamil",
    description: "The inspiring narrative of Chola Prince Vikraman fulfilling his father King Parthiban's dream of Chola restoration."
  },
  {
    id: 108,
    title: "Gopallapurathu Makkal",
    author: "Ki. Rajanarayanan",
    category: "Folk Literature",
    year: 1989,
    available: true,
    rating: 4.8,
    isbn: "978-8184680089",
    pages: 350,
    language: "Tamil",
    description: "A celebrated Sahitya Akademi-winning tale of migration, folk resilience, and life in the arid Karisal country."
  },
  {
    id: 109,
    title: "Silapathikaram",
    author: "Ilango Adigal",
    category: "Classic Literature",
    year: 500,
    available: true,
    rating: 4.9,
    isbn: "978-8184680096",
    pages: 480,
    language: "Tamil",
    description: "One of the Five Great Epics of Tamil literature, following Kannagi's relentless quest for justice against the Pandyan king."
  },
  {
    id: 110,
    title: "Kadal Pura",
    author: "Sandilyan",
    category: "Historical Fiction",
    year: 1967,
    available: true,
    rating: 4.8,
    isbn: "978-8184680102",
    pages: 1450,
    language: "Tamil",
    description: "An adventurous historical naval romance following the expeditions of the Chola navy across Southeast Asian waters."
  }
];

export const DEFAULT_MEMBER_DATA = {
  id: "AK-LIB-101",
  memberId: "AK-LIB-101",
  name: "Aravind Kumar",
  email: "aravind.kumar@gmail.com",
  phone: "+91 98765 43210",
  branch: "AK Central Library, Chennai",
  membershipTier: "Gold Scholar",
  joinedDate: "2024-01-15",
  maxBooksAllowed: 5,
  activeLoansCount: 0,
  preferredCategories: ["Historical Fiction", "Epic Fiction", "Philosophy & Ethics"],
  membershipStatus: "Active"
};
