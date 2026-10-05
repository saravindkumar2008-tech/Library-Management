import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="empty-box" style={{ margin: "60px auto", maxWidth: "600px" }}>
      <div className="empty-icon">🧭</div>
      <h2>404 - Page Not Found</h2>
      <p>The library route you are trying to visit does not exist.</p>
      <div style={{ marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center" }}>
        <Link to="/" className="btn-primary">
          Return to Home
        </Link>
        <Link to="/books" className="btn-secondary">
          Browse Book Catalog
        </Link>
        <Link to="/member" className="btn-secondary">
          Member Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
