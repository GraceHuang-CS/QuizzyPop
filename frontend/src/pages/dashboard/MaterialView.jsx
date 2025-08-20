// frontend/src/pages/MaterialView.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMaterialById } from "../../api/studyService";
import { getQuizAttempts } from "../../api/quizService";
import Flashcards from "../../components/Flashcards";
import Quiz from "../../components/Quiz";
import Summary from "../../components/Summary";
import "../../styles/pgs/MaterialView.css";
import NavBar from "../../components/NavBar";
const MaterialView = () => {
  const { materialId } = useParams();
  const [material, setMaterial] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttemptHistory, setShowAttemptHistory] = useState(false);

  useEffect(() => {
    const loadMaterial = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view materials");
          return;
        }

        const materialData = await getMaterialById(materialId, token);
        setMaterial(materialData);

        // If it's a quiz, also fetch attempt history
        if (materialData.materialType === "quiz") {
          try {
            const attempts = await getQuizAttempts(materialId, token);
            console.log("attempts", attempts);
            setQuizAttempts(attempts);
          } catch (err) {
            console.warn("Could not fetch quiz attempts:", err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMaterial();
  }, [materialId]);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQuizStats = () => {
    if (!quizAttempts.length) return null;

    const questionCount = material.content?.questions?.length || 0;
    const bestScore = Math.max(...quizAttempts.map((a) => a.score));
    const averageScore =
      quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length;

    return {
      totalAttempts: quizAttempts.length,
      bestScore,
      bestPercentage:
        questionCount > 0 ? Math.round((bestScore / questionCount) * 100) : 0,
      averageScore: Math.round(averageScore * 10) / 10,
      averagePercentage:
        questionCount > 0
          ? Math.round((averageScore / questionCount) * 100)
          : 0,
      questionCount,
    };
  };

  if (loading) {
    return (
      <div className="material-view-page">
        <NavBar />
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading material...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="material-view-page">
        <NavBar />
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Error Loading Material</h2>
            <p>{error}</p>
            <Link to="/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="material-view-page">
        <NavBar />
        <div className="container">
          <div className="error-state">
            <div className="error-icon">📄</div>
            <h2>Material Not Found</h2>
            <p>The requested material could not be found.</p>
            <Link to="/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quizStats = getQuizStats();

  return (
    <div className="material-view-page">
      <NavBar />

      <div className="container">
        <div className="material-header">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>

          <div className="material-info">
            <div className="material-title-section">
              <div className="material-icon">
                {getIcon(material.materialType)}
              </div>
              <div>
                <h1 className="material-title">{material.fileName}</h1>
                <div className="material-meta">
                  <span className="material-type">
                    {material.materialType.charAt(0).toUpperCase() +
                      material.materialType.slice(1)}
                  </span>
                  <span className="creation-date">
                    Created: {formatDate(material.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz Statistics */}
            {material.materialType === "quiz" && quizStats && (
              <div className="quiz-statistics">
                <h3>Quiz Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-number">
                      {quizStats.totalAttempts}
                    </span>
                    <span className="stat-label">Total Attempts</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {quizStats.bestPercentage}%
                    </span>
                    <span className="stat-label">Best Score</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {quizStats.averagePercentage}%
                    </span>
                    <span className="stat-label">Average Score</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {quizStats.questionCount}
                    </span>
                    <span className="stat-label">Questions</span>
                  </div>
                </div>

                {quizAttempts.length > 0 && (
                  <button
                    className="toggle-history-button"
                    onClick={() => setShowAttemptHistory(!showAttemptHistory)}
                  >
                    {showAttemptHistory ? "Hide" : "Show"} Attempt History
                  </button>
                )}

                {showAttemptHistory && (
                  <div className="attempt-history">
                    <h4>Attempt History</h4>
                    <div className="attempts-list">
                      {quizAttempts.map((attempt, index) => (
                        <div key={index} className="attempt-item">
                          <div className="attempt-score">
                            {attempt.score}/{quizStats.questionCount}
                          </div>
                          <div className="attempt-percentage">
                            {Math.round(
                              (attempt.score / quizStats.questionCount) * 100
                            )}
                            %
                          </div>
                          <div className="attempt-date">
                            {formatDate(attempt.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Material Content */}
        <div className="material-content">
          {material.materialType === "flashcard" && material.content?.cards && (
            <Flashcards cards={material.content.cards} />
          )}

          {material.materialType === "quiz" && material.content?.questions && (
            <Quiz
              questions={material.content.questions}
              materialId={materialId}
            />
          )}

          {material.materialType === "summary" && material.content?.summary && (
            <Summary summary={material.content.summary} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialView;
