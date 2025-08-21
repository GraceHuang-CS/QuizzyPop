import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import { registerUser, googleSignUp } from "../../api/auth";
import NavBar from "../../components/NavBar";
import SignUpPageSticker from "../../assets/SignUpPageSticker.png";
import logo from "../../assets/logo.png";
import "../../styles/pgs/RegisterPage.css";
import Overlay from "../../components/MessageOverlay";
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [overlayContent, setOverlayContent] = useState(null);
  const handleGoogleSignUp = useCallback(
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

          // Check if it's a new registration or existing user login
          if (data.message === "Account created successfully") {
            // New user - show success message briefly then redirect to dashboard/home
            setTimeout(() => {
              navigate("/login", { replace: true }); // or wherever you want new users to go
            }, 2000);
          } else if (data.message === "Login successful") {
            // Existing user - show message that they're already registered
            setMessage("You're already registered. Redirecting to log in...");
            setTimeout(() => {
              navigate("/login", { replace: true }); // or wherever logged in users should go
            }, 2000);
          }
        }
      } catch (error) {
        // Handle different error scenarios
        if (
          error.message.includes("already registered") ||
          error.message.includes("already exists")
        ) {
          setMessage("You're already registered. Redirecting to log in...");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        } else {
          setMessage(error.message || "Google sign-up failed");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Add this to your .env file
          callback: handleGoogleSignUp,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          {
            theme: "outline",
            size: "large",
            text: "signup_with",
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
  }, [handleGoogleSignUp]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await registerUser({ name, email, password });
      setMessage(data.message);

      if (data.message.toLowerCase().includes("success")) {
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        // Show success message for a moment before redirecting
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getMessageColor = (message) => {
    if (
      message.toLowerCase().includes("success") ||
      message.toLowerCase().includes("created") ||
      message.toLowerCase().includes("logging you in")
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
          </div>
          <div className="illustration">
            <div className="img-container2">
              <img src={SignUpPageSticker} alt="Illustration" />
            </div>
          </div>
        </div>
        <div className="form-box">
          <h2>Create an account</h2>

          {/* Google Sign-Up Button */}
          <div className="google">
            <div id="google-signup-button"></div>
          </div>

          {/* Regular Form */}
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
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
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                width: "100%",
                marginTop: "1rem",
              }}
            >
              {loading ? "Registering..." : "Register with Email"}
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

          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
