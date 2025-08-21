import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import { loginUser, googleSignUp } from "../../api/auth"; // Assuming you have googleSignIn function
import NavBar from "../../components/NavBar";
import SignUpPageSticker from "../../assets/SignUpPageSticker.png"; // Same illustration
import logo from "../../assets/logo.png";
import "../../styles/pgs/LoginPage.css";
import Overlay from "../../components/MessageOverlay";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const handleGoogleSignIn = useCallback(
    async (response) => {
      setLoading(true);
      setMessage("");

      try {
        // Send the credential token to your backend
        const data = await googleSignUp({ credential: response.credential });

        // Display the message from backend
        setMessage(data.message);

        // Store auth token if provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);

          if (data.message.toLowerCase().includes("success")) {
            setTimeout(() => {
              navigate("/study", { replace: true });
            }, 1000);
          }
        }
      } catch (error) {
        setMessage(error.message || "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: 300,
          }
        );
      }
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [handleGoogleSignIn]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await loginUser({ email, password });

    setMessage(result.message);

    if (result.success) {
      setFormData({ email: "", password: "" });
      navigate("/study");
    }

    setLoading(false);
  };

  const getMessageColor = (message) => {
    if (
      message.toLowerCase().includes("success") ||
      message.toLowerCase().includes("login successful")
    ) {
      return "green";
    }
    return "red";
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
              <img src={SignUpPageSticker} alt="Illustration" />
            </div>
          </div>
        </div>

        <div className="form-box">
          <h2>Welcome back</h2>

          {/* Google Sign-In Button */}
          <div className="google">
            <div id="google-signin-button"></div>
          </div>

          {/* Regular Form */}
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />

            <div className="forgot-password">
              <a href="/forgot-password">Forgot your password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                width: "100%",
                marginTop: "1rem",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: "1rem",
                color: getMessageColor(message),
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              {message}
            </p>
          )}

          <div className="login-links">
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
