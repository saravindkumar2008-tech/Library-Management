import React, { useMemo } from "react";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "./BookCard";

function Recommendations() {
  const { books, readingHistory, borrowedBooks, openBookDetail, borrowBook, placeHold } = useLibrary();

  // Requirement e: useMemo for personalized book recommendations
  const recommendedBooks = useMemo(() => {
    // Basic recommendation logic: 
    // Find the user's most read category from history and borrowed books
    const allUserBooks = [...readingHistory, ...borrowedBooks];
    const categoryCounts = {};
    
    allUserBooks.forEach((book) => {
      categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
    });

    let topCategory = null;
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    // Get books in the top category that the user hasn't read or borrowed yet
    const readBookIds = new Set(allUserBooks.map(b => b.id));
    
    let recommendations = books.filter(b => b.category === topCategory && !readBookIds.has(b.id));

    // Fallback: If no top category or no unread books in top category, recommend some available books
    if (recommendations.length === 0) {
      recommendations = books.filter(b => b.available && !readBookIds.has(b.id));
    }

    // Limit to top 3 recommendations
    return recommendations.slice(0, 3);
  }, [books, readingHistory, borrowedBooks]);

  if (recommendedBooks.length === 0) return null;

  return (
    <div className="recommendations-section">
      <h3>Recommended For You</h3>
      <div className="book-list">
        {recommendedBooks.map((book) => (
          <BookCard 
            key={book.id} 
            book={book} 
            openBookDetail={openBookDetail}
            borrowBook={borrowBook}
            placeHold={placeHold}
          />
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
