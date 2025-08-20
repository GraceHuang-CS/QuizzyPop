import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/cpns/NavBar.css";
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <nav className="navbar">
        <div className="left-side">
          <div className="logo">
            <span className="star">⭐</span> QuizzyPop
          </div>
        </div>

        <div className="right-side">
          <div className="nav-links">
            <Link to="/">🏠 Home</Link>
            <Link to="/dashboard">📊 Dashboard</Link>
          </div>
          <div className="avatar">🧔</div>
          <button onClick={() => setIsOpen(true)}>☰</button>
        </div>
      </nav>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="side-header">
          <div className="avatar big"> 🧔</div>
          <span className="username">Next Door</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <ul>
          <li> 🧔 Profile</li>
          <li>⚙️ Setting</li>
          <hr />
          <li>📜 Privacy Policy</li>
          <li>❓ Help Centre</li>
          <li>ℹ️ About QuizzyPop</li>
          <hr />
          <li className="logout">🚪 Log Out</li>
        </ul>
      </div>
    </>
  );
};

export default NavBar;
