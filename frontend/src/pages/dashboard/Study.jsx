import React, { useState, useEffect } from "react";
import "../../styles/pgs/Study.css";
import GeminiService from "../../api/geminiService.js";
import Flashcards from "../../components/Flashcards.jsx";
import Quiz from "../../components/Quiz.jsx";
import Summary from "../../components/Summary.jsx";
import { saveMaterialToDashboard } from "../../api/studyService";
import NavBar from "../../components/NavBar.jsx";
const Study = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [file, setFile] = useState(null);
  const [materialType, setMaterialType] = useState("flashcard");
  const [pageRange, setPageRange] = useState({
    from: "",
    to: "",
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  useEffect(() => {
    // whenever materialType changes, reset previous result & save status
    setResult(null);
    setSaveStatus(null);
  }, [materialType]);
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setSaveStatus(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveStatus(null);

    try {
      // const geminiService = new GeminiService(apiKey.trim());

      // const range =
      //   pageRange.enabled && pageRange.from && pageRange.to
      //     ? { from: parseInt(pageRange.from), to: parseInt(pageRange.to) }
      //     : null;

      // const response = await geminiService.processFile(
      //   file,
      //   materialType,
      //   range
      // );
      // setResult(response);
      // console.log("Generated result:", response);

      // // Auto-save to dashboard if user is logged in
      // await autoSaveToDashboard(response);
      const mockGeneratedResult = (() => {
        switch (materialType) {
          case "flashcard":
            return {
              cards: [
                { question: "What is the capital of France?", answer: "Paris" },
                { question: "What is 2 + 2?", answer: "4" },
              ],
            };
          case "quiz":
            return {
              questions: [
                {
                  question: "What is the largest planet?",
                  options: ["Earth", "Mars", "Jupiter", "Venus"],
                  answer: "Jupiter",
                },
              ],
            };
          case "summary":
            return {
              summary: "This is a mock summary of the uploaded file.",
            };
          default:
            return {};
        }
      })();

      setResult(mockGeneratedResult); // Update UI
      // ✅ Only auto-save **after generating**
      await autoSaveToDashboard(mockGeneratedResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoSaveToDashboard = async (generatedResult) => {
    console.log("Auto-saving to dashboard...");

    const token = localStorage.getItem("token");
    if (!token) {
      setSaveStatus("not_logged_in");
      return;
    }

    setSaveStatus("saving");

    try {
      const savedMaterial = await saveMaterialToDashboard(
        {
          fileName: file.name,
          materialType,
          content: generatedResult,
        },
        token
      );

      // Notify dashboard of new material
      window.dispatchEvent(
        new CustomEvent("materialGenerated", {
          detail: { materialData: savedMaterial },
        })
      );

      setSaveStatus("saved");
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSaveStatus("save_failed");
    }
  };
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="save-status saving">
            <div className="spinner"></div>
            Saving to dashboard...
          </div>
        );
      case "saved":
        return (
          <div className="save-status saved">
            ✅ Saved to dashboard successfully!
          </div>
        );
      case "save_failed":
        return (
          <div className="save-status failed">
            ⚠️ Failed to save to dashboard
          </div>
        );
      case "not_logged_in":
        return (
          <div className="save-status not-logged-in">
            💡 Login to automatically save your materials to dashboard
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <NavBar />
      <div className="study-material-generator">
        <div className="container">
          <header className="header">
            <h1>Transform your learning with QuizzyPop Ai</h1>
          </header>

          <form onSubmit={handleSubmit} className="generate-form">
            {/* File Upload */}
            <div className="form-group">
              <h2>Upload your study materials</h2>
              <div
                className={`file-upload-area ${
                  dragActive ? "drag-active" : ""
                } ${file ? "has-file" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  accept=".pdf,.pptx,.ppt,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.txt,.rtf,.doc,.docx"
                  style={{ display: "none" }}
                />
                {file ? (
                  <div className="file-info">
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent triggering file upload click
                        setFile(null);
                        setSaveStatus(null);
                        document.getElementById("fileInput").value = null; // reset input
                      }}
                    >
                      ×
                    </button>
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="upload-icon">📁</div>
                    <p>Drop your file here or click to browse</p>
                    <small>
                      Supported formats: PDF, PPT, PPTX, DOC, DOCX, RTF, TXT,
                      and All Images (JPG, PNG, GIF, WebP, BMP, TIFF)
                    </small>
                  </div>
                )}
              </div>
            </div>
            {/* Page Range (optional) */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={pageRange.enabled}
                  onChange={(e) =>
                    setPageRange({ ...pageRange, enabled: e.target.checked })
                  }
                />
                Specify page range from your study material
              </label>
              {pageRange.enabled && (
                <div className="page-range-inputs">
                  <input
                    type="number"
                    placeholder="From page"
                    value={pageRange.from}
                    onChange={(e) =>
                      setPageRange({ ...pageRange, from: e.target.value })
                    }
                    min="1"
                    className="input-field"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="To page"
                    value={pageRange.to}
                    onChange={(e) =>
                      setPageRange({ ...pageRange, to: e.target.value })
                    }
                    min="1"
                    className="input-field"
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>What would you like to generate?</label>
              <div className="material-type-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="flashcard"
                    checked={materialType === "flashcard"}
                    onChange={(e) => setMaterialType(e.target.value)}
                  />
                  <div className="radio-content">
                    <div className="radio-icon">🗂️</div>
                    <div>
                      <div className="radio-title">Flashcards</div>
                    </div>
                  </div>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="quiz"
                    checked={materialType === "quiz"}
                    onChange={(e) => setMaterialType(e.target.value)}
                  />
                  <div className="radio-content">
                    <div className="radio-icon">📝</div>
                    <div>
                      <div className="radio-title">Quiz</div>
                    </div>
                  </div>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="summary"
                    checked={materialType === "summary"}
                    onChange={(e) => setMaterialType(e.target.value)}
                  />
                  <div className="radio-content">
                    <div className="radio-icon">📋</div>
                    <div>
                      <div className="radio-title">Summary</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div className="button-box">
              <button
                type="submit"
                disabled={loading || !file || !apiKey.trim()}
                className="generate-button"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Generate{" "}
                    {materialType === "flashcard"
                      ? "Flashcards"
                      : materialType === "quiz"
                      ? "Quiz"
                      : "Summary"}
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div>{error}</div>
            </div>
          )}
          {result && (
            <div className="results">
              {materialType === "flashcard" && result.cards && (
                <Flashcards cards={result.cards} />
              )}
              {materialType === "quiz" && result.questions && (
                <Quiz questions={result.questions} />
              )}
              {materialType === "summary" && result.summary && (
                <Summary summary={result.summary} />
              )}
            </div>
          )}
          {saveStatus && renderSaveStatus()}
        </div>
      </div>
    </>
  );
};

export default Study;
