import React from "react";
import "../styles/cpns/Summary.css";
const Summary = ({ summary }) => {
  return (
    <div className="summary-container">
      <h3>Generated Summary</h3>
      <div className="summary-content">
        {summary
          .split("\n")
          .map(
            (paragraph, index) =>
              paragraph.trim() && <p key={index}>{paragraph}</p>
          )}
      </div>
    </div>
  );
};

export default Summary;
