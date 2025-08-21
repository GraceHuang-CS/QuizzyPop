import React, { useState } from "react";
import FormInput from "../../components/FormInput";
import NavBar from "../../components/NavBar";
import { forgotPasswordUser } from "../../api/auth";
import ForgotPasswordPageSticker from "../../assets/ForgotPasswordPageSticker.png";
import logo from "../../assets/logo.png";
import "../../styles/pgs/RegisterPage.css";
import Overlay from "../../components/MessageOverlay";
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const result = await forgotPasswordUser(email);

    setMessage(result.message);
    setSuccess(result.success);
    setLoading(false);
  };

  return (
    <div className="content">
      <NavBar onOpenOverlay={setOverlayContent} />
      {overlayContent && (
        <Overlay onClose={() => setOverlayContent(null)}>
          {overlayContent}
        </Overlay>
      )}
      <div className="big-container">
        <div className="left-section">
          <div className="logo">
            <div className="img-container">
              <img className="logo" src={logo} alt="Logo" />
            </div>
            <p>QuizzyPop</p>
          </div>
          <div className="illustration">
            <div className="img-container2">
              <img src={ForgotPasswordPageSticker} alt="Illustration" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-box">
          <h2>Forgot Password</h2>
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "0.5rem 1rem" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: "1rem", color: success ? "green" : "red" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
