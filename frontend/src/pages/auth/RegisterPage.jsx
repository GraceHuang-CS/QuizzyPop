import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import { registerUser, googleSignUp } from "../../api/auth";

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

  // Google Sign-Up handler
  const handleGoogleSignUp = useCallback(
    async (response) => {
      setLoading(true);
      setMessage("");

      try {
        // Send the credential token to your backend
        const data = await googleSignUp({ credential: response.credential });
        setMessage(data.message);

        if (data.message.toLowerCase().includes("success")) {
          // Store auth token if provided
          if (data.token) {
            localStorage.setItem("authToken", data.token);
          }
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        setMessage(error.message || "Google sign-up failed");
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
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Add this to your .env file
          callback: handleGoogleSignUp,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          {
            theme: "outline",
            size: "large",
            text: "signup_with",
            width: "100%",
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
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });

      if (data.message.toLowerCase().includes("success")) {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Register</h2>

      {/* Google Sign-Up Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div id="google-signup-button"></div>
      </div>

      {/* Divider */}
      <div
        style={{
          textAlign: "center",
          margin: "1rem 0",
          position: "relative",
          borderTop: "1px solid #ddd",
        }}
      >
        <span
          style={{
            background: "white",
            padding: "0 1rem",
            color: "#666",
            position: "absolute",
            top: "-10px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          OR
        </span>
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
            color: message.includes("successfully") ? "green" : "red",
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
  );
};

export default RegisterPage;
