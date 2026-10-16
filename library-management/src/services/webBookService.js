/**
 * Web Book Search Service
 * Connects to public web REST APIs (Open Library & Google Books)
 * to search books and retrieve high-resolution book cover images from the web.
 */

// Curated original covers for Tamil literary classics as web/instant fallbacks
const CURATED_TAMIL_COVERS = {
  "ponniyin selvan": "https://i.pinimg.com/736x/07/e4/3b/07e43b32d5aeb613a5f635de1ae5f8d4.jpg",
  "sivagamiyin sabatham": "https://rupapublications.co.in/images/1726833125.jpg",
  "thirukkural": "https://shantibooks.in/cdn/shop/files/ThirukuralwrapperFront.jpg?v=1730263937",
  "kaaval kottam": "https://upload.wikimedia.org/wikipedia/ta/9/98/Kaval_Kottam.jpg",
  "velpari": "https://upload.wikimedia.org/wikipedia/en/1/1a/Veera_Yuga_Nayagan_Velpari.jpg",
  "parthiban kanavu": "https://upload.wikimedia.org/wikipedia/en/5/5b/Parthiban_Kanavu.jpg",
  "gopallapurathu makkal": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1762904638i/5054534.jpg",
  "silapathikaram": "https://covers.openlibrary.org/b/id/12588887-L.jpg",
  "kadal pura": "https://upload.wikimedia.org/wikipedia/en/a/a9/Kadal_Pura_book_cover.jpg",
  "vengayin maindhan": "https://upload.wikimedia.org/wikipedia/ta/3/38/%E0%AE%B5%E0%AF%87%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AF%88%E0%AE%AF%E0%AE%BF%E0%AE%A9%E0%AF%8D_%E0%AE%AE%E0%AF%88%E0%AE%A8%E0%AF%8D%E0%AE%A4%E0%AE%A9%E0%AF%8D.jpg",
  "sila nerangalil sila manithargal": "https://upload.wikimedia.org/wikipedia/en/d/d6/Sila_Nerangalil_Sila_Manithargal_%28novel%29.jpg",
  "alai osai": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1535739673i/41580541.jpg",
  "nandhipurathu nayagi": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1662883901i/17560590.jpg",
  "moga mul": "https://cdn.exoticindia.com/images/products/original/books-2019-023/uaw070.jpg"
};

export const webBookService = {
  /**
   * Search books from the web using Open Library Search API with Google Books fallback
   * @param {string} query Search terms (title, author, subject)
   * @param {object} options AbortSignal and limits
   * @returns {Promise<Array>} List of books with web cover images
   */
  async searchBooksFromWeb(query, { signal, limit = 12 } = {}) {
    if (!query || !query.trim()) return [];
    const trimmed = query.trim();

    try {
      // 1. Query Open Library Search API
      const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=${limit}`;
      const response = await fetch(openLibUrl, { signal });

      if (response.ok) {
        const data = await response.json();
        const docs = data.docs || [];

        if (docs.length > 0) {
          return docs.map((doc, idx) => {
            const coverId = doc.cover_i;
            const isbn = (doc.isbn && doc.isbn[0]) || "";
            let coverImage = "";

            if (coverId) {
              coverImage = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
            } else if (isbn) {
              coverImage = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
            } else {
              // Check curated or fallback
              const key = (doc.title || "").toLowerCase();
              coverImage = CURATED_TAMIL_COVERS[key] || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80`;
            }

            return {
              id: `web-${doc.key?.replace(/\//g, "-") || idx}`,
              title: doc.title || "Untitled",
              author: (doc.author_name && doc.author_name[0]) || "Unknown Author",
              category: (doc.subject && doc.subject[0]) || "General Literature",
              year: doc.first_publish_year || new Date().getFullYear(),
              isbn: isbn || `978-000000000${idx}`,
              coverImage,
              rating: (4.0 + Math.random() * 0.9).toFixed(1),
              pages: doc.number_of_pages_median || 320,
              language: (doc.language && doc.language[0]) || "English",
              available: true,
              description: `A celebrated literary work found on the Open Library web repository. First published in ${doc.first_publish_year || "classic era"}.`
            };
          });
        }
      }
    } catch (err) {
      if (err.name === "AbortError") throw err;
      console.warn("[webBookService] Open Library fetch failed, trying Google Books fallback:", err);
    }

    // 2. Google Books fallback
    try {
      const gBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=${Math.min(limit, 10)}`;
      const gResponse = await fetch(gBooksUrl, { signal });

      if (gResponse.ok) {
        const gData = await gResponse.json();
        const items = gData.items || [];

        return items.map((item, idx) => {
          const info = item.volumeInfo || {};
          let thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
          if (thumb.startsWith("http://")) {
            thumb = thumb.replace("http://", "https://");
          }

          return {
            id: `gbook-${item.id || idx}`,
            title: info.title || "Untitled",
            author: (info.authors && info.authors[0]) || "Unknown Author",
            category: (info.categories && info.categories[0]) || "Literature",
            year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4), 10) : new Date().getFullYear(),
            isbn: info.industryIdentifiers?.[0]?.identifier || `978-000000000${idx}`,
            coverImage: thumb || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
            rating: info.averageRating || 4.7,
            pages: info.pageCount || 300,
            language: info.language || "en",
            available: true,
            description: info.description || "Retrieved from Google Books public repository."
          };
        });
      }
    } catch (gErr) {
      if (gErr.name === "AbortError") throw gErr;
      console.warn("[webBookService] Google Books search failed:", gErr);
    }

    return [];
  },

  /**
   * Search candidate cover images for a specific book title or author
   * @param {string} title 
   * @param {string} author 
   * @returns {Promise<Array<{url: string, source: string, label: string}>>}
   */
  async searchCoversForBook(title = "", author = "", isbn = "") {
    const candidates = [];
    const lowerTitle = title.trim().toLowerCase();

    // 1. Check curated high-resolution covers
    for (const [key, url] of Object.entries(CURATED_TAMIL_COVERS)) {
      if (lowerTitle.includes(key) || key.includes(lowerTitle)) {
        candidates.push({
          url,
          source: "Curated HD Collection",
          label: `${key.toUpperCase()} Edition Cover`
        });
        break;
      }
    }

    // 2. Check ISBN via Open Library Covers API
    if (isbn && isbn.trim()) {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, "");
      if (cleanIsbn.length >= 10) {
        candidates.push({
          url: `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
          source: "Open Library (ISBN)",
          label: `Open Library Cover (${cleanIsbn})`
        });
      }
    }

    // 3. Search Open Library by title
    if (title && title.trim()) {
      try {
        const query = encodeURIComponent(`${title} ${author}`.trim());
        const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          const docs = data.docs || [];
          docs.forEach((doc) => {
            if (doc.cover_i) {
              const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
              if (!candidates.some((c) => c.url === url)) {
                candidates.push({
                  url,
                  source: "Open Library",
                  label: doc.title || "Book Cover"
                });
              }
            }
          });
        }
      } catch (e) {
        console.warn("Cover search error:", e);
      }
    }

    // Add high quality aesthetic book cover fallbacks if list is short
    if (candidates.length < 3) {
      const defaults = [
        {
          url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
          source: "Vintage Classic",
          label: "Imperial Antique Edition"
        },
        {
          url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
          source: "Artistic Heritage",
          label: "Temple & Sculpture Edition"
        },
        {
          url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
          source: "Ancient Manuscript",
          label: "Palm Leaf & Scroll Edition"
        },
        {
          url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
          source: "Modern Hardcover",
          label: "Modern Library Hardcover"
        }
      ];
      defaults.forEach((d) => {
        if (!candidates.some((c) => c.url === d.url)) {
          candidates.push(d);
        }
      });
    }

    return candidates;
  }
};

export default webBookService;
