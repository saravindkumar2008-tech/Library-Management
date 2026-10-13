import React, { useState, useEffect, useCallback } from "react";
import { useLibrary } from "../context/LibraryContext";
import { bookService } from "../services/bookService";
import BookCard from "./BookCard";
import Loading from "./common/Loading";

/**
 * Recommendations Component
 * Fetches personalized book recommendations from REST API endpoint:
 * GET /api/recommendations?memberId={id}&category={category}
 * Satisfies Requirements d, e, f.
 */
function Recommendations() {
  const { member, readingHistory, borrowedBooks, openBookDetail, borrowBook, placeHold, apiEngine } = useLibrary();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine top category from reading history/borrowed books if any
  const preferredCategory = (() => {
    const all = [...readingHistory, ...borrowedBooks];
    if (all.length > 0) {
      const counts = {};
      all.forEach((b) => {
        counts[b.category] = (counts[b.category] || 0) + 1;
      });
      let top = null;
      let max = 0;
      Object.entries(counts).forEach(([cat, cnt]) => {
        if (cnt > max) {
          max = cnt;
          top = cat;
        }
      });
      if (top) return top;
    }
    return member?.preferredCategories ? member.preferredCategories[0] : "Historical Fiction";
  })();

  const fetchRecommendationsFromApi = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const data = await bookService.fetchRecommendations({
        memberId: member?.memberId || "AK-LIB-101",
        category: preferredCategory,
        limit: 3,
        signal: controller.signal
      });
      setRecommendations(data);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch API recommendations:", err);
      setError(err.message || "Failed to load recommendations from REST API.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [member?.memberId, preferredCategory]);

  useEffect(() => {
    fetchRecommendationsFromApi();
  }, [fetchRecommendationsFromApi]);

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <div>
          <h3>✨ Recommended For You (REST API Powered)</h3>
          <p className="recommendations-subtitle">
            Curated recommendations fetched dynamically via <code>GET /api/recommendations</code> using <strong>{apiEngine.toUpperCase()}</strong>.
          </p>
        </div>
        <button
          className="btn-refresh-recs"
          onClick={fetchRecommendationsFromApi}
          disabled={loading}
          title="Re-query API recommendations"
        >
          {loading ? "Fetching..." : "🔄 Refresh Recommendations"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="recs-loading-card">
          <Loading
            message={`Querying recommendation model via REST API (${apiEngine.toUpperCase()})...`}
            size="sm"
          />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="empty-box error-alert-box" style={{ padding: "20px", margin: "10px 0" }}>
          <p style={{ color: "var(--danger)", fontWeight: "600" }}>⚠️ {error}</p>
          <button className="btn-primary" style={{ marginTop: "10px" }} onClick={fetchRecommendationsFromApi}>
            🔄 Retry Recommendation API
          </button>
        </div>
      )}

      {/* Recommendations List */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="recommendations-grid">
          {recommendations.map((book) => (
            <div key={book.id} className="recommendation-card-wrapper">
              <div className="recommendation-badge-strip">
                <span className="rec-match-score">🎯 {book.matchScore || "95%"} Match</span>
                <span className="rec-tag">{book.badge || "AI Pick"}</span>
              </div>
              <p className="rec-reason-text">
                💡 <em>{book.recommendationReason || `Top match for ${book.category}`}</em>
              </p>
              <BookCard
                book={book}
                openBookDetail={openBookDetail}
                borrowBook={borrowBook}
                placeHold={placeHold}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <p className="no-recs-text">No recommendations available at this time.</p>
      )}
    </div>
  );
}

export default Recommendations;
