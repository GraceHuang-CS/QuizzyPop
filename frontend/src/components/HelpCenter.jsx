import React from "react";

const HelpCenter = () => {
  return (
    <div>
      <h2>Help Centre</h2>
      <p>
        <div
          style={{
            padding: "1.5rem",
            lineHeight: "1.6",
            fontFamily: "Arial, sans-serif",
            color: "#333",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Welcome to the <strong>QuizzyPop Help Center</strong>! Here you’ll
            find answers to common questions and guidance on how to use our
            platform.
          </p>

          <h3 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
            📘 Getting Started
          </h3>
          <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>How do I sign up?</li>
            <li style={{ marginBottom: "0.5rem" }}>
              Click “Log in” at the top-right corner, enter your email, and
              create a password.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>How do I log in?</li>
            <li style={{ marginBottom: "0.5rem" }}>
              Use the “Log In” button and enter your email and password.
            </li>
          </ul>

          <h3 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
            📝 Using Quizzes
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            How do I take a quiz? Choose your study material and upload the
            file. After that, choose “Quiz” and click “Start.” Where can I see
            my quiz history? Your quiz results are saved in dashboard under “My
            Progress.”
          </p>

          <h3 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
            🎴 Using Flashcards
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            How do I review flashcards? Choose your study material and upload
            the file. After that, choose “Flashcard” and click “Start.”
          </p>

          <h3 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
            ⚙️ Account & Settings
          </h3>
          <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              How do I change my password? Go to your profile, then choose
              “Change Password.”
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              How do I delete my account? Go to your profile, then choose
              “Delete Account.”
            </li>
          </ul>

          <h3 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
            ❓ Still Need Help?
          </h3>
          <p>
            If you can’t find your answer here, reach out to us: <br />
            📧 Email:{" "}
            <a href="mailto:teamnextdoor@gmail.com">teamnextdoor@gmail.com</a>
          </p>
        </div>
      </p>
    </div>
  );
};

export default HelpCenter;
