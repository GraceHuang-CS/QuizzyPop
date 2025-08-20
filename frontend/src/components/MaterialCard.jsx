// frontend/src/components/MaterialCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/cpns/MaterialCard.css";

const MaterialCard = ({ material, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case "flashcard":
        return "🗂️";
      case "quiz":
        return "📝";
      case "summary":
        return "📋";
      default:
        return "📄";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getQuizStats = () => {
    if (material.materialType !== "quiz" || !material.quizAttempts?.length) {
      return null;
    }

    const attempts = material.quizAttempts;
    const lastAttempt = attempts[attempts.length - 1];
    const questionCount = material.content?.questions?.length || 0;
    const bestScore = Math.max(...attempts.map((a) => a.score));
    const bestPercentage =
      questionCount > 0 ? Math.round((bestScore / questionCount) * 100) : 0;

    return {
      totalAttempts: attempts.length,
      lastScore: lastAttempt.score,
      lastPercentage:
        questionCount > 0
          ? Math.round((lastAttempt.score / questionCount) * 100)
          : 0,
      bestScore,
      bestPercentage,
      questionCount,
    };
  };

  const quizStats = getQuizStats();

  return (
    <div className="material-card">
      <div className="card-header">
        <div className="material-icon">{getIcon(material.materialType)}</div>
        <div className="card-actions">
          <button
            className="delete-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (
                window.confirm("Are you sure you want to delete this material?")
              ) {
                onDelete();
              }
            }}
            title="Delete material"
          >
            🗑️
          </button>
        </div>
      </div>

      <Link to={`/material/${material._id}`} className="card-content-link">
        <div className="card-content">
          <h3 className="material-title">{material.fileName}</h3>

          <div className="material-meta">
            <span className="material-type">
              {material.materialType.charAt(0).toUpperCase() +
                material.materialType.slice(1)}
            </span>
            <span className="creation-date">
              {formatDate(material.createdAt)}
            </span>
          </div>

          {material.materialType === "quiz" && (
            <div className="quiz-info">
              <div className="question-count">
                {material.content?.questions?.length || 0} questions
              </div>

              {quizStats && (
                <div className="quiz-stats">
                  <div className="stat-row">
                    <span className="stat-label">Attempts:</span>
                    <span className="stat-value">
                      {quizStats.totalAttempts}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Best Score:</span>
                    <span className="stat-value">
                      {quizStats.bestScore}/{quizStats.questionCount} (
                      {quizStats.bestPercentage}%)
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Last Score:</span>
                    <span className="stat-value">
                      {quizStats.lastScore}/{quizStats.questionCount} (
                      {quizStats.lastPercentage}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {material.materialType === "flashcard" && (
            <div className="flashcard-info">
              <div className="card-count">
                {material.content?.cards?.length || 0} cards
              </div>
            </div>
          )}

          {material.materialType === "summary" && (
            <div className="summary-info">
              <div className="summary-preview">
                {material.content?.summary?.substring(0, 100)}
                {material.content?.summary?.length > 100 ? "..." : ""}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MaterialCard;
