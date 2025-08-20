import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001";

export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await axios.post("/api/auth/register", {
      name,
      email,
      password,
    });

    const { token, user, message } = response.data;

    // Save token and set default header
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { success: true, message, user, token };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post("/api/auth/login", { email, password });
    const { token, user, message } = response.data;

    // Store token and set default header
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { success: true, message, user, token };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const forgotPasswordUser = async (email) => {
  try {
    const response = await axios.post("/api/auth/forgot-password", { email });
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send reset email",
    };
  }
};

export const resetPasswordUser = async (token, password, confirmPassword) => {
  try {
    const response = await axios.post(`/api/auth/reset-password/${token}`, {
      password,
      confirmPassword,
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Password reset failed",
    };
  }
};

export async function googleSignUp(googleData) {
  try {
    const response = await axios.post("`/auth/google-signup`", googleData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    // Axios error handling
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Google sign-up failed");
    }
    throw new Error(error.message || "Google sign-up failed");
  }
}
