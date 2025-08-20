import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/auth/HomePage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import LogInPage from "./pages/auth/LogInPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
