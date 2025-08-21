import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/auth.js";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Camera,
  Edit3,
} from "lucide-react";
import "../../styles/pgs/Profile.css";
import InputOverlay from "../../components/InputOverlay.jsx";
import { deleteAccount } from "../../api/auth.js";
import NavBar from "../../components/NavBar.jsx";
import { useNavigate } from "react-router-dom";
import Overlay from "../../components/MessageOverlay.jsx";
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ShowNameOverlay, setShowNameOverlay] = useState(false);
  const [newName, setNewName] = useState("");
  const [overlayContent, setOverlayContent] = useState(null);
  const Navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      setError("Please register or log in to see your profile.");
      setLoading(false);
      Navigate("/register");
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const result = await getProfile();

      if (result.success) {
        setProfile(result.user);
      } else {
        setError(result.message);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [token, Navigate]);

  const getAuthProviderDisplay = (provider) => {
    switch (provider) {
      case "google":
        return {
          name: "Google",
          className: "auth-provider-google",
          icon: "🔗",
        };
      case "local":
      default:
        return {
          name: "Email & Password",
          className: "auth-provider-local",
          icon: "🔐",
        };
    }
  };
  const handleCP = () => {
    Navigate("/forgot-password");
  };
  const handleNameSubmit = async () => {
    const result = await updateProfile(newName);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert("Name updated successfully!");
    setShowNameOverlay(false);
  };
  const handleDeleteAcc = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;

    const result = await deleteAccount();
    alert(result.message);

    if (result.success) {
      window.location.href = "/"; // redirect to homepage or login
    }
  };
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <>
        <NavBar onOpenOverlay={setOverlayContent} />
        {overlayContent && (
          <Overlay onClose={() => setOverlayContent(null)}>
            {overlayContent}
          </Overlay>
        )}
        <div className="profile-page">
          <div className="profile-card loading-card">
            <div className="loading-skeleton">
              <div className="loading-header">
                <div className="loading-avatar"></div>
                <div className="loading-text">
                  <div className="loading-line loading-line-large"></div>
                  <div className="loading-line loading-line-medium"></div>
                </div>
              </div>
              <div className="loading-content">
                <div className="loading-line"></div>
                <div className="loading-line loading-line-medium"></div>
                <div className="loading-line loading-line-small"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar onOpenOverlay={setOverlayContent} />
        {overlayContent && (
          <Overlay onClose={() => setOverlayContent(null)}>
            {overlayContent}
          </Overlay>
        )}
        <div className="profile-page">
          <div className="profile-card error-card">
            <div className="error-icon">
              <XCircle size={32} />
            </div>
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <NavBar onOpenOverlay={setOverlayContent} />
        {overlayContent && (
          <Overlay onClose={() => setOverlayContent(null)}>
            {overlayContent}
          </Overlay>
        )}
        <div className="profile-page">
          <div className="profile-card error-card">
            <div className="error-icon">
              <User size={32} />
            </div>
            <h2 className="error-title">No Profile Data</h2>
            <p className="error-message">
              Unable to load your profile information.
            </p>
          </div>
        </div>
      </>
    );
  }

  const authProvider = getAuthProviderDisplay(profile.authProvider);

  return (
    <>
      <NavBar onOpenOverlay={setOverlayContent} />
      {overlayContent && (
        <Overlay onClose={() => setOverlayContent(null)}>
          {overlayContent}
        </Overlay>
      )}
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">
              Manage your account information and preferences
            </p>
          </div>

          <div className="profile-card">
            <div className="profile-hero">
              <div className="profile-hero-content">
                <div className="pic-box">
                  <div className="profile-avatar-container">
                    {profile.picture ? (
                      <img
                        src={profile.picture}
                        alt={profile.name || "Profile"}
                        className="profile-avatar"
                      />
                    ) : (
                      <div className="profile-avatar profile-avatar-initials">
                        {getInitials(profile.name)}
                      </div>
                    )}
                    <div className="profile-avatar-overlay">
                      <Camera size={24} />
                    </div>
                  </div>
                </div>
                {/* Name and Email */}
                <div className="profile-info">
                  <h2 className="profile-name">
                    {profile.name || "Unknown User"}
                  </h2>
                  <p className="profile-email">
                    <Mail size={20} />
                    {profile.email}
                  </p>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setShowNameOverlay(!ShowNameOverlay)}
                  className="btn btn-secondary profile-edit-btn"
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {ShowNameOverlay && (
              <InputOverlay
                label="Enter your name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onClose={() => setShowNameOverlay(false)}
                onSubmit={() => handleNameSubmit()}
              />
            )}

            <div className="profile-content">
              <div className="profile-grid">
                {/* Account Information */}
                <div className="profile-section">
                  <h3 className="section-title">Account Information</h3>

                  <div className="form-group">
                    <label className="form-label">
                      <Shield size={16} />
                      Authentication Method
                    </label>
                    <div className={`auth-badge ${authProvider.className}`}>
                      <span className="auth-icon">{authProvider.icon}</span>
                      {authProvider.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="profile-actions">
                <div className="action-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCP()}
                  >
                    Change Password
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteAcc()}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
