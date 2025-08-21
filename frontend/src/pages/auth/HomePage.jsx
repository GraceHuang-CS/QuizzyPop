import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import "../../styles/pgs/HomePage.css";
import HomePageSticker from "../../assets/HomePageSticker.png";
import Overlay from "../../components/MessageOverlay";
const HomePage = () => {
  const [overlayContent, setOverlayContent] = useState(null);
  const Navigate = useNavigate();
  const handleOnClick = () => {
    Navigate("/register");
  };

  return (
    <div>
      <NavBar onOpenOverlay={setOverlayContent} />
      {overlayContent && (
        <Overlay onClose={() => setOverlayContent(null)}>
          {overlayContent}
        </Overlay>
      )}
      <div className="content">
        <div className="vertical">
          <div className="container">
            <div className="title">Welcome to QuizzyPop!</div>
            <button className="button" onClick={() => handleOnClick()}>
              Let's Start ➤
            </button>
          </div>
          <div className="message">Brought to you by Team Next Door</div>
        </div>

        <div className="image-container">
          <img
            className="image"
            src={HomePageSticker}
            alt="Logo"
            width="50"
            height="50"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
