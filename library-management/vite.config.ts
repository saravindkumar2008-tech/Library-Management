import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const SEED_BOOKS = [
  {
    id: 101,
    title: "Ponniyin Selvan",
    author: "Kalki Krishnamurthy",
    category: "Historical Fiction",
    year: 1955,
    available: true,
    rating: 4.9,
    isbn: "978-8184680010",
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
    description: "An adventurous historical naval romance following the expeditions of the Chola navy across Southeast Asian waters."
  }
];

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockRestApiPlugin = () => ({
  name: 'mock-rest-api',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (!req.url?.startsWith('/api/')) {
        return next();
      }

      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;
      const params = parsedUrl.searchParams;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
      }

      // GET /api/books
      if (req.method === 'GET' && pathname === '/api/books') {
        const search = (params.get('search') || '').trim().toLowerCase();
        const category = params.get('category') || 'All';
        const author = params.get('author') || 'All';
        const available = params.get('available') || 'All';

        const filtered = SEED_BOOKS.filter((b) => {
          const matchesSearch = !search ||
            b.title.toLowerCase().includes(search) ||
            b.author.toLowerCase().includes(search) ||
            b.description.toLowerCase().includes(search);
          const matchesCategory = category === 'All' || b.category.toLowerCase() === category.toLowerCase();
          const matchesAuthor = author === 'All' || b.author.toLowerCase() === author.toLowerCase();
          let matchesAvail = true;
          if (available === 'Available' || available === 'true') matchesAvail = b.available === true;
          else if (available === 'Unavailable' || available === 'false') matchesAvail = b.available === false;
          return matchesSearch && matchesCategory && matchesAuthor && matchesAvail;
        });

        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          count: filtered.length,
          total: SEED_BOOKS.length,
          books: filtered
        }));
      }

      // GET /api/books/:id
      const bookDetailMatch = pathname.match(/^\/api\/books\/([^/]+)$/);
      if (req.method === 'GET' && bookDetailMatch) {
        const id = bookDetailMatch[1];
        const book = SEED_BOOKS.find((b) => String(b.id) === String(id) || String(b.id) === String(Number(id) - 100));
        if (!book) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, error: `Book #${id} not found` }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, book }));
      }

      // GET /api/members/current
      if (req.method === 'GET' && (pathname === '/api/members/current' || pathname.startsWith('/api/members/'))) {
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          member: {
            memberId: "AK-LIB-101",
            name: "Aravind Kumar",
            email: "aravind.kumar@gmail.com",
            phone: "+91 98765 43210",
            branch: "AK Central Library, Chennai",
            membershipTier: "Gold Scholar",
            joinedDate: "2024-01-15",
            maxBooksAllowed: 5,
            activeLoansCount: 0,
            preferredCategories: ["Historical Fiction", "Epic Fiction", "Philosophy & Ethics"]
          }
        }));
      }

      // GET /api/recommendations
      if (req.method === 'GET' && pathname === '/api/recommendations') {
        const category = params.get('category') || 'Historical Fiction';
        const recs = SEED_BOOKS.filter(b => b.category.toLowerCase() === category.toLowerCase()).slice(0, 3);
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          recommendations: recs.map((r, i) => ({
            ...r,
            recommendationReason: `Top match in ${category} literature`,
            matchScore: `${95 - i * 4}%`
          }))
        }));
      }

      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockRestApiPlugin()],
})

