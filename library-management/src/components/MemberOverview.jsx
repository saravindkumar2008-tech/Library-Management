import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";

function MemberOverview() {
  const navigate = useNavigate();
  const {
    member,
    borrowedBooks,
    readingHistory,
    holdRequests,
    overdueBooks,
    dueSoonBooks,
    readingStatistics,
    renewBook,
    returnBook
  } = useLibrary();

  return (
    <div className="member-overview">
      {/* Welcome Banner */}
      <div className="overview-welcome-card">
        <div className="welcome-avatar">👤</div>
        <div className="welcome-details">
          <h2>Welcome back, {member?.name || "Aravind Kumar"}!</h2>
          <p>
            Member ID: <strong>{member?.memberId || "AK-LIB-101"}</strong> • Tier:{" "}
            <span className="tier-tag">{member?.membershipTier || "Gold Scholar"}</span> • Branch:{" "}
            {member?.branch || "AK Central Library, Chennai"}
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/books" className="btn-primary">
            + Borrow New Book
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat-card" onClick={() => navigate("/member/borrowed")}>
          <div className="dash-stat-icon">📖</div>
          <div className="dash-stat-body">
            <span className="dash-stat-num">{borrowedBooks.length}</span>
            <span className="dash-stat-title">Active Borrowed</span>
          </div>
        </div>

        <div className="dash-stat-card warning" onClick={() => navigate("/member/borrowed")}>
          <div className="dash-stat-icon">⏰</div>
          <div className="dash-stat-body">
            <span className="dash-stat-num">{dueSoonBooks.length}</span>
            <span className="dash-stat-title">Due Soon (≤3 Days)</span>
          </div>
        </div>

        <div className="dash-stat-card danger" onClick={() => navigate("/member/borrowed")}>
          <div className="dash-stat-icon">⚠️</div>
          <div className="dash-stat-body">
            <span className="dash-stat-num">{overdueBooks.length}</span>
            <span className="dash-stat-title">Overdue Books</span>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => navigate("/member/history")}>
          <div className="dash-stat-icon">📜</div>
          <div className="dash-stat-body">
            <span className="dash-stat-num">{readingHistory.length}</span>
            <span className="dash-stat-title">Books Completed</span>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => navigate("/member/borrowed")}>
          <div className="dash-stat-icon">⏳</div>
          <div className="dash-stat-body">
            <span className="dash-stat-num">{holdRequests.length}</span>
            <span className="dash-stat-title">Active Holds</span>
          </div>
        </div>
      </div>

      {/* Quick Active Loans Table / List */}
      <div className="dashboard-section">
        <div className="section-header-bar">
          <div>
            <h3>Active Borrowed Books ({borrowedBooks.length})</h3>
            <p className="subtitle">Manage renewals or return books directly from your dashboard.</p>
          </div>
          <Link to="/member/borrowed" className="btn-secondary">
            View All in Borrowed tab →
          </Link>
        </div>

        {borrowedBooks.length === 0 ? (
          <div className="empty-box" style={{ padding: "30px" }}>
            <p>You have no active borrowings at the moment.</p>
            <Link to="/books" className="btn-primary" style={{ marginTop: "12px", display: "inline-block" }}>
              Explore Tamil Literature Catalog
            </Link>
          </div>
        ) : (
          <div className="active-loans-table-wrap">
            <table className="active-loans-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Due Date</th>
                  <th>Renewals</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.map((book) => {
                  const renewalsUsed = book.renewalCount || 0;
                  const maxRenewals = book.maxRenewals || 2;
                  const canRenew = renewalsUsed < maxRenewals;

                  return (
                    <tr key={book.id}>
                      <td>
                        <Link to={`/book/${book.id}`} className="table-book-title">
                          <strong>{book.title}</strong>
                        </Link>
                      </td>
                      <td>{book.author}</td>
                      <td>{book.category}</td>
                      <td>
                        <span className="due-pill">{book.dueDate}</span>
                      </td>
                      <td>
                        {renewalsUsed} / {maxRenewals}
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button
                            className="btn-renew-sm"
                            disabled={!canRenew}
                            onClick={() => renewBook(book.id)}
                            title={canRenew ? "Renew +7 days" : "Max renewals reached"}
                          >
                            Renew
                          </button>
                          <button
                            className="btn-return-sm"
                            onClick={() => returnBook(book.id)}
                          >
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigation Quick Links */}
      <div className="quick-links-grid">
        <div className="quick-card" onClick={() => navigate("/member/recommendations")}>
          <h4>✨ Personalized Recommendations</h4>
          <p>Discover hand-picked Tamil titles based on your reading history.</p>
          <span className="card-arrow">Go to Recommendations →</span>
        </div>

        <div className="quick-card" onClick={() => navigate("/member/profile")}>
          <h4>👤 Profile & Reading Stats</h4>
          <p>View top reading categories, membership details, and update contact info.</p>
          <span className="card-arrow">Edit Profile →</span>
        </div>

        <div className="quick-card" onClick={() => navigate("/member/history")}>
          <h4>📜 Reading History</h4>
          <p>Review every book you've borrowed and completed from AK Library.</p>
          <span className="card-arrow">View History →</span>
        </div>
      </div>
    </div>
  );
}

export default MemberOverview;
