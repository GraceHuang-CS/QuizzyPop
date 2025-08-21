import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/cpns/NavBar.css";
import { logoutUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import QuizzyPop from "./QuizzyPop";
import HelpCenter from "./HelpCenter";
import PrivacyPolicy from "./PrivacyPolicy";
import logo from "../assets/logo.png";
const NavBar = ({ onOpenOverlay }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Navigate = useNavigate();
  const handleLogOut = () => {
    const result = logoutUser();
    alert(result.message);
    Navigate("/login");
  };
  const handleProfileClick = () => {
    Navigate("/get-profile");
  };
  return (
    <>
      <nav className="navbar">
        <div className="left-side">
          <div className="nav-logo">
            <img src={logo} alt="logo" style={{ width: "40px" }} />
            QuizzyPop
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
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <ul>
          <li onClick={() => handleProfileClick()}> 🧔 Profile</li>
          <hr />
          <li onClick={() => onOpenOverlay(<PrivacyPolicy />)}>
            Privacy Policy
          </li>
          <li onClick={() => onOpenOverlay(<QuizzyPop />)}>About App</li>
          <li onClick={() => onOpenOverlay(<HelpCenter />)}>Help Centre</li>
          <hr />
          <li className="logout" onClick={() => handleLogOut()}>
            🚪 Log Out
          </li>
        </ul>
      </div>
    </>
  );
};

export default NavBar;
