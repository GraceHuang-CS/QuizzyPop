import React from "react";
import "../styles/cpns/Summary.css";
const Summary = ({ summary }) => {
  return (
    <div className="summary-container">
      <h3>Summary</h3>
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
// import React from "react";
// import "../styles/cpns/Summary.css";

// const Summary = ({ summary }) => {
//   const points = summary
//     .split("\n")
//     .map((paragraph) => paragraph.trim())
//     .filter((paragraph) => paragraph.length > 0);

//   return (
//     <div className="summary-container">
//       <h3>Summary</h3>
//       <ul className="summary-list">
//         {points.map((point, index) => (
//           <li key={index}>{point}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Summary;
