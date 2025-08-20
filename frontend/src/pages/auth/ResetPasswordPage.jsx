// frontend/src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import { resetPasswordUser } from "../../api/auth";
import ForgotPasswordPageSticker from "../../assets/ForgotPasswordPageSticker.png";
import logo from "../../assets/logo.png";
import "../../styles/pgs/RegisterPage.css";
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields");
      setSuccess(false);
      return;
    }
    if (!token) {
      setMessage("Invalid or missing token.");
      setSuccess(false);
      return;
    }
    setLoading(true);
    setMessage("");
    setSuccess(false);

    const result = await resetPasswordUser(token, password, confirmPassword);

    setMessage(result.message);
    setSuccess(result.success);

    if (result.success) {
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="content">
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
          <h2>Reset Password</h2>
          <FormInput
            label="New Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;
