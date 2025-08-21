// frontend/src/components/Quiz.jsx
import React, { useState } from "react";
import { submitQuizAttempt } from "../api/quizService";
import "../styles/cpns/Quiz.css";

const Quiz = ({
  questions,
  materialId = null,
  isMockExam = false,
  onComplete = null,
  initialAttempt = null, // For retakes
}) => {
  // Initialize selectedAnswers with undefined for all questions
  const [selectedAnswers, setSelectedAnswers] = useState(
    initialAttempt
      ? initialAttempt.answers
      : Array(questions.length).fill(undefined)
  );
  const [quizFinished, setQuizFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  if (!questions || questions.length === 0) return null;

  const handleSelect = (qIndex, optionIndex) => {
    const newSelected = [...selectedAnswers];
    newSelected[qIndex] = optionIndex;
    setSelectedAnswers(newSelected);
  };

  const handleFinishQuiz = async () => {
    if (isMockExam && onComplete) {
      onComplete(selectedAnswers);
      return;
    }

    if (!materialId) {
      setQuizFinished(true);
      setShowReview(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const result = await submitQuizAttempt(
        materialId,
        selectedAnswers,
        token
      );
      setAttemptResult(result);
      setQuizFinished(true);
      setShowReview(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      setQuizFinished(true);
      setShowReview(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine if an answer is correct
  const isAnswerCorrect = (question, selectedOptionIndex) => {
    if (selectedOptionIndex === undefined) return false;

    const selectedOption = question.options[selectedOptionIndex];

    if (typeof question.answer === "number") {
      return selectedOptionIndex === question.answer;
    } else if (typeof question.answer === "string") {
      const normalizeText = (text) => text.toString().trim().toLowerCase();
      return normalizeText(selectedOption) === normalizeText(question.answer);
    }

    return selectedOption === question.answer;
  };

  const getCorrectAnswerIndex = (question) => {
    if (typeof question.answer === "number") return question.answer;

    const normalizeText = (text) => text.toString().trim().toLowerCase();
    const normalizedAnswer = normalizeText(question.answer);

    return question.options.findIndex(
      (option) => normalizeText(option) === normalizedAnswer
    );
  };

  const calculateScore = () => {
    let score = 0;
    selectedAnswers.forEach((answerIndex, index) => {
      const question = questions[index];
      if (!question || answerIndex === undefined) return;
      if (isAnswerCorrect(question, answerIndex)) score++;
    });
    return score;
  };

  const handleRetake = () => {
    setSelectedAnswers(Array(questions.length).fill(undefined));
    setQuizFinished(false);
    setShowReview(false);
    setAttemptResult(null);
  };

  // Review mode
  if (quizFinished && showReview) {
    const score = attemptResult?.score ?? calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="quiz-container review-mode">
        <div className="quiz-header">
          <h3>{isMockExam ? "Mock Exam" : "Quiz"} Results</h3>
          <div className="score-summary">
            <div className="score-circle">
              <span className="score-number">You got {score}</span>
              <span className="score-total">
                /{questions.length} questions right!
              </span>
            </div>
            <div className="score-percentage">
              Your percentage: {percentage}%
            </div>
          </div>
        </div>

        <div className="quiz-questions review">
          {questions.map((question, index) => {
            const userAnswerIndex = selectedAnswers[index];
            const isCorrect = isAnswerCorrect(question, userAnswerIndex);
            const correctAnswerIndex = getCorrectAnswerIndex(question);

            return (
              <div key={index} className="quiz-question">
                <div className="question-header">
                  <h4>Question {index + 1}</h4>
                  <span
                    className={`question-result ${
                      isCorrect ? "correct" : "incorrect"
                    }`}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                  {question.sourceName && (
                    <span className="question-source">
                      Source: {question.sourceName}
                    </span>
                  )}
                </div>
                <p className="question-text">{question.question}</p>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = userAnswerIndex === optionIndex;
                    const isCorrectOption = optionIndex === correctAnswerIndex;

                    let optionClass = "quiz-option";
                    if (isCorrectOption) optionClass += " correct-answer";
                    if (isSelected && !isCorrectOption)
                      optionClass += " wrong-answer";
                    if (isSelected && isCorrectOption)
                      optionClass += " correct-selected";

                    return (
                      <div key={optionIndex} className={optionClass}>
                        <span className="option-letter">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span className="option-text">{option}</span>
                        {isCorrectOption && (
                          <span className="answer-indicator correct">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="answer-indicator wrong">
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="quiz-actions">
          <button className="retake-button" onClick={handleRetake}>
            🔄 Retake {isMockExam ? "Exam" : "Quiz"}
          </button>
        </div>
      </div>
    );
  }

  // Taking quiz mode - show ALL questions
  return (
    <div className="quiz-container taking-mode">
      <div className="quiz-header">
        <h3>{isMockExam ? "Mock Exam" : "Quiz"}</h3>
      </div>

      <div className="quiz-questions">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="quiz-question">
            {question.sourceName && (
              <div className="question-source">
                Source: {question.sourceName}
              </div>
            )}
            <p className="question-text">
              Question {qIndex + 1}: {question.question}
            </p>
            <div className="quiz-options">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[qIndex] === optionIndex;
                return (
                  <div
                    key={optionIndex}
                    className={`quiz-option ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(qIndex, optionIndex)}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <span className="option-text">{option}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-actions">
        <button
          className="nav-button primary"
          onClick={handleFinishQuiz}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner small"></div>
              Submitting...
            </>
          ) : (
            `Finish ${isMockExam ? "Exam" : "Quiz"}`
          )}
        </button>
      </div>
    </div>
  );
};

export default Quiz;

// // frontend/src/components/Quiz.jsx
// import React, { useState } from "react";
// import { submitQuizAttempt } from "../api/quizService";
// import "../styles/cpns/Quiz.css";

// const Quiz = ({
//   questions,
//   materialId = null,
//   isMockExam = false,
//   onComplete = null,
//   initialAttempt = null, // For retakes
// }) => {
//   // Initialize selectedAnswers with undefined for all questions
//   const [selectedAnswers, setSelectedAnswers] = useState(
//     initialAttempt
//       ? initialAttempt.answers
//       : Array(questions.length).fill(undefined)
//   );
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [quizFinished, setQuizFinished] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [attemptResult, setAttemptResult] = useState(null);
//   const [showReview, setShowReview] = useState(false);

//   if (!questions || questions.length === 0) return null;
//   const currentQuestion = questions[currentQuestionIndex];

//   const handleSelect = (optionIndex) => {
//     const newSelected = [...selectedAnswers];
//     newSelected[currentQuestionIndex] = optionIndex;
//     setSelectedAnswers(newSelected);
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     } else {
//       handleFinishQuiz();
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleFinishQuiz = async () => {
//     if (isMockExam && onComplete) {
//       onComplete(selectedAnswers);
//       return;
//     }

//     if (!materialId) {
//       setQuizFinished(true);
//       setShowReview(true);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       const result = await submitQuizAttempt(
//         materialId,
//         selectedAnswers,
//         token
//       );
//       setAttemptResult(result);
//       setQuizFinished(true);
//       setShowReview(true);
//     } catch (error) {
//       console.error("Failed to submit quiz:", error);
//       setQuizFinished(true);
//       setShowReview(true);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Helper function to determine if an answer is correct
//   const isAnswerCorrect = (question, selectedOptionIndex) => {
//     if (selectedOptionIndex === undefined) return false;

//     const selectedOption = question.options[selectedOptionIndex];

//     // Try multiple comparison methods to handle different answer formats
//     if (typeof question.answer === "number") {
//       // If answer is stored as an index
//       return selectedOptionIndex === question.answer;
//     } else if (typeof question.answer === "string") {
//       // If answer is stored as text, normalize both strings for comparison
//       const normalizeText = (text) => text.toString().trim().toLowerCase();
//       return normalizeText(selectedOption) === normalizeText(question.answer);
//     }

//     // Fallback: direct comparison
//     return selectedOption === question.answer;
//   };

//   // Helper function to get the correct answer index
//   const getCorrectAnswerIndex = (question) => {
//     if (typeof question.answer === "number") {
//       return question.answer;
//     }

//     // Find the index of the correct answer text
//     const normalizeText = (text) => text.toString().trim().toLowerCase();
//     const normalizedAnswer = normalizeText(question.answer);

//     return question.options.findIndex(
//       (option) => normalizeText(option) === normalizedAnswer
//     );
//   };

//   const calculateScore = () => {
//     let score = 0;
//     selectedAnswers.forEach((answerIndex, index) => {
//       const question = questions[index];
//       if (!question || answerIndex === undefined) return;

//       if (isAnswerCorrect(question, answerIndex)) {
//         score++;
//       }
//     });

//     console.log(`Final calculated score: ${score}/${questions.length}`);
//     console.log(
//       "Score breakdown:",
//       selectedAnswers.map((answer, index) => ({
//         questionIndex: index,
//         selectedAnswer: answer,
//         selectedText:
//           answer !== undefined ? questions[index].options[answer] : "No answer",
//         correctAnswer: questions[index].answer,
//         isCorrect: isAnswerCorrect(questions[index], answer),
//       }))
//     );

//     return score;
//   };

//   const handleRetake = () => {
//     setCurrentQuestionIndex(0);
//     setSelectedAnswers(Array(questions.length).fill(undefined));
//     setQuizFinished(false);
//     setShowReview(false);
//     setAttemptResult(null);
//   };

//   const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

//   // Review mode
//   if (quizFinished && showReview) {
//     const score = attemptResult?.score ?? calculateScore();
//     const percentage = Math.round((score / questions.length) * 100);

//     return (
//       <div className="quiz-container review-mode">
//         <div className="quiz-header">
//           <h3>{isMockExam ? "Mock Exam" : "Quiz"} Results</h3>
//           <div className="score-summary">
//             <div className="score-circle">
//               <span className="score-number">{score}</span>
//               <span className="score-total">/{questions.length}</span>
//             </div>
//             <div className="score-percentage">{percentage}%</div>
//           </div>
//         </div>

//         <div className="quiz-actions">
//           <button className="retake-button" onClick={handleRetake}>
//             🔄 Retake {isMockExam ? "Exam" : "Quiz"}
//           </button>
//         </div>

//         <div className="quiz-questions review">
//           {questions.map((question, index) => {
//             const userAnswerIndex = selectedAnswers[index];
//             const isCorrect = isAnswerCorrect(question, userAnswerIndex);
//             const correctAnswerIndex = getCorrectAnswerIndex(question);

//             return (
//               <div key={index} className="quiz-question">
//                 <div className="question-header">
//                   <h4>Question {index + 1}</h4>
//                   <span
//                     className={`question-result ${
//                       isCorrect ? "correct" : "incorrect"
//                     }`}
//                   >
//                     {isCorrect ? "✓ Correct" : "✗ Incorrect"}
//                   </span>
//                   {question.sourceName && (
//                     <span className="question-source">
//                       Source: {question.sourceName}
//                     </span>
//                   )}
//                 </div>
//                 <p className="question-text">{question.question}</p>
//                 <div className="quiz-options">
//                   {question.options.map((option, optionIndex) => {
//                     const isSelected = userAnswerIndex === optionIndex;
//                     const isCorrectOption = optionIndex === correctAnswerIndex;

//                     let optionClass = "quiz-option";
//                     if (isCorrectOption) optionClass += " correct-answer";
//                     if (isSelected && !isCorrectOption)
//                       optionClass += " wrong-answer";
//                     if (isSelected && isCorrectOption)
//                       optionClass += " correct-selected";

//                     return (
//                       <div key={optionIndex} className={optionClass}>
//                         <span className="option-letter">
//                           {String.fromCharCode(65 + optionIndex)}.
//                         </span>
//                         <span className="option-text">{option}</span>
//                         {isCorrectOption && (
//                           <span className="answer-indicator correct">
//                             ✓ Correct Answer
//                           </span>
//                         )}
//                         {isSelected && !isCorrectOption && (
//                           <span className="answer-indicator wrong">
//                             ✗ Your Answer
//                           </span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   }

//   // Taking quiz mode
//   return (
//     <div className="quiz-container taking-mode">
//       <div className="quiz-header">
//         <h3>
//           {isMockExam ? "Mock Exam" : "Quiz"} - Question{" "}
//           {currentQuestionIndex + 1} of {questions.length}
//         </h3>
//         <div className="progress-bar">
//           <div
//             className="progress-fill"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>

//       <div className="quiz-question">
//         {currentQuestion.sourceName && (
//           <div className="question-source">
//             Source: {currentQuestion.sourceName}
//           </div>
//         )}
//         <p className="question-text">{currentQuestion.question}</p>
//         <div className="quiz-options">
//           {currentQuestion.options.map((option, optionIndex) => {
//             const isSelected =
//               selectedAnswers[currentQuestionIndex] === optionIndex;
//             return (
//               <div
//                 key={optionIndex}
//                 className={`quiz-option ${isSelected ? "selected" : ""}`}
//                 onClick={() => handleSelect(optionIndex)}
//               >
//                 <span className="option-letter">
//                   {String.fromCharCode(65 + optionIndex)}.
//                 </span>
//                 <span className="option-text">{option}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="quiz-navigation">
//         <button
//           className="nav-button secondary"
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//         >
//           Previous
//         </button>

//         <div className="question-indicator">
//           {selectedAnswers[currentQuestionIndex] !== undefined ? (
//             <span className="answered">✓ Answered</span>
//           ) : (
//             <span className="unanswered">⚪ Not answered</span>
//           )}
//         </div>

//         <button
//           className="nav-button primary"
//           onClick={handleNext}
//           disabled={
//             selectedAnswers[currentQuestionIndex] === undefined || isSubmitting
//           }
//         >
//           {isSubmitting ? (
//             <>
//               <div className="spinner small"></div>
//               Submitting...
//             </>
//           ) : currentQuestionIndex === questions.length - 1 ? (
//             `Finish ${isMockExam ? "Exam" : "Quiz"}`
//           ) : (
//             "Next Question"
//           )}
//         </button>
//       </div>

//       {questions.length > 5 && (
//         <div className="quiz-overview">
//           <div className="overview-title">Question Overview:</div>
//           <div className="overview-dots">
//             {questions.map((_, index) => (
//               <button
//                 key={index}
//                 className={`overview-dot ${
//                   index === currentQuestionIndex ? "current" : ""
//                 } ${selectedAnswers[index] !== undefined ? "answered" : ""}`}
//                 onClick={() => setCurrentQuestionIndex(index)}
//               >
//                 {index + 1}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Quiz;
// frontend/src/components/Quiz.jsx
// import React, { useState } from "react";
// import { submitQuizAttempt } from "../api/studyService";
// import "../styles/cpns/Quiz.css";

// const Quiz = ({
//   questions,
//   materialId = null,
//   isMockExam = false,
//   onComplete = null,
//   initialAttempt = null, // For retakes
// }) => {
//   // Initialize selectedAnswers with undefined for all questions
//   const [selectedAnswers, setSelectedAnswers] = useState(
//     initialAttempt
//       ? initialAttempt.answers
//       : Array(questions.length).fill(undefined)
//   );
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [quizFinished, setQuizFinished] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [attemptResult, setAttemptResult] = useState(null);
//   const [showReview, setShowReview] = useState(false);
//   if (!questions || questions.length === 0) return null;
//   const currentQuestion = questions[currentQuestionIndex];

//   const handleSelect = (optionIndex) => {
//     const newSelected = [...selectedAnswers];
//     newSelected[currentQuestionIndex] = optionIndex;
//     setSelectedAnswers(newSelected);
//   };

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     } else {
//       handleFinishQuiz();
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleFinishQuiz = async () => {
//     if (isMockExam && onComplete) {
//       onComplete(selectedAnswers);
//       return;
//     }

//     if (!materialId) {
//       setQuizFinished(true);
//       setShowReview(true);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       const result = await submitQuizAttempt(
//         materialId,
//         selectedAnswers,
//         token
//       );
//       setAttemptResult(result);
//       setQuizFinished(true);
//       setShowReview(true);
//     } catch (error) {
//       console.error("Failed to submit quiz:", error);
//       setQuizFinished(true);
//       setShowReview(true);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const calculateScore = () => {
//     let score = 0;
//     selectedAnswers.forEach((answerIndex, index) => {
//       const question = questions[index];
//       if (!question || answerIndex === undefined) return;

//       const selectedValue = question.options[answerIndex];
//       if (selectedValue === question.answer) {
//         score++;
//       }
//     });

//     console.log(`Final calculated score: ${score}/${questions.length}`);
//     return score;
//   };

//   const handleRetake = () => {
//     setCurrentQuestionIndex(0);
//     setSelectedAnswers(Array(questions.length).fill(undefined));
//     setQuizFinished(false);
//     setShowReview(false);
//     setAttemptResult(null);
//   };

//   const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

//   // Review mode
//   if (quizFinished && showReview) {
//     const score = attemptResult?.score ?? calculateScore();
//     const percentage = Math.round((score / questions.length) * 100);

//     return (
//       <div className="quiz-container review-mode">
//         <div className="quiz-header">
//           <h3>{isMockExam ? "Mock Exam" : "Quiz"} Results</h3>
//           <div className="score-summary">
//             <div className="score-circle">
//               <span className="score-number">{score}</span>
//               <span className="score-total">/{questions.length}</span>
//             </div>
//             <div className="score-percentage">{percentage}%</div>
//           </div>
//         </div>

//         <div className="quiz-actions">
//           <button className="retake-button" onClick={handleRetake}>
//             🔄 Retake {isMockExam ? "Exam" : "Quiz"}
//           </button>
//         </div>

//         <div className="quiz-questions review">
//           {questions.map((question, index) => {
//             const userAnswerIndex = selectedAnswers[index];
//             const correctAnswer = question.answer;

//             return (
//               <div key={index} className="quiz-question">
//                 <div className="question-header">
//                   <h4>Question {index + 1}</h4>
//                   <span
//                     className={`question-result ${
//                       userAnswerIndex !== undefined &&
//                       question.options[userAnswerIndex] === correctAnswer
//                         ? "correct"
//                         : "incorrect"
//                     }`}
//                   >
//                     {userAnswerIndex !== undefined &&
//                     question.options[userAnswerIndex] === correctAnswer
//                       ? "✓ Correct"
//                       : "✗ Incorrect"}
//                   </span>
//                   {question.sourceName && (
//                     <span className="question-source">
//                       Source: {question.sourceName}
//                     </span>
//                   )}
//                 </div>
//                 <p className="question-text">{question.question}</p>
//                 <div className="quiz-options">
//                   {question.options.map((option, optionIndex) => {
//                     const isSelected = userAnswerIndex === optionIndex;
//                     const isCorrectOption = option === correctAnswer;

//                     let optionClass = "quiz-option";
//                     if (isCorrectOption) optionClass += " correct-answer";
//                     if (isSelected && !isCorrectOption)
//                       optionClass += " wrong-answer";
//                     if (isSelected && isCorrectOption)
//                       optionClass += " correct-selected";

//                     return (
//                       <div key={optionIndex} className={optionClass}>
//                         <span className="option-letter">
//                           {String.fromCharCode(65 + optionIndex)}.
//                         </span>
//                         <span className="option-text">{option}</span>
//                         {isCorrectOption && (
//                           <span className="answer-indicator correct">
//                             ✓ Correct Answer
//                           </span>
//                         )}
//                         {isSelected && !isCorrectOption && (
//                           <span className="answer-indicator wrong">
//                             ✗ Your Answer
//                           </span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   }

//   // Taking quiz mode
//   return (
//     <div className="quiz-container taking-mode">
//       <div className="quiz-header">
//         <h3>
//           {isMockExam ? "Mock Exam" : "Quiz"} - Question{" "}
//           {currentQuestionIndex + 1} of {questions.length}
//         </h3>
//         <div className="progress-bar">
//           <div
//             className="progress-fill"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>

//       <div className="quiz-question">
//         {currentQuestion.sourceName && (
//           <div className="question-source">
//             Source: {currentQuestion.sourceName}
//           </div>
//         )}
//         <p className="question-text">{currentQuestion.question}</p>
//         <div className="quiz-options">
//           {currentQuestion.options.map((option, optionIndex) => {
//             const isSelected =
//               selectedAnswers[currentQuestionIndex] === optionIndex;
//             return (
//               <div
//                 key={optionIndex}
//                 className={`quiz-option ${isSelected ? "selected" : ""}`}
//                 onClick={() => handleSelect(optionIndex)}
//               >
//                 <span className="option-letter">
//                   {String.fromCharCode(65 + optionIndex)}.
//                 </span>
//                 <span className="option-text">{option}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="quiz-navigation">
//         <button
//           className="nav-button secondary"
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//         >
//           Previous
//         </button>

//         <div className="question-indicator">
//           {selectedAnswers[currentQuestionIndex] !== undefined ? (
//             <span className="answered">✓ Answered</span>
//           ) : (
//             <span className="unanswered">⚪ Not answered</span>
//           )}
//         </div>

//         <button
//           className="nav-button primary"
//           onClick={handleNext}
//           disabled={
//             selectedAnswers[currentQuestionIndex] === undefined || isSubmitting
//           }
//         >
//           {isSubmitting ? (
//             <>
//               <div className="spinner small"></div>
//               Submitting...
//             </>
//           ) : currentQuestionIndex === questions.length - 1 ? (
//             `Finish ${isMockExam ? "Exam" : "Quiz"}`
//           ) : (
//             "Next Question"
//           )}
//         </button>
//       </div>

//       {questions.length > 5 && (
//         <div className="quiz-overview">
//           <div className="overview-title">Question Overview:</div>
//           <div className="overview-dots">
//             {questions.map((_, index) => (
//               <button
//                 key={index}
//                 className={`overview-dot ${
//                   index === currentQuestionIndex ? "current" : ""
//                 } ${selectedAnswers[index] !== undefined ? "answered" : ""}`}
//                 onClick={() => setCurrentQuestionIndex(index)}
//               >
//                 {index + 1}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Quiz;
