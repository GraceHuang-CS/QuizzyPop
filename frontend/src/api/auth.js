import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

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
    const response = await axios.post("/api/auth/google-signup", googleData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { token, user, message } = response.data;

    // Store token like your other functions do
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return { success: true, message, user, token };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Google sign-up failed",
    };
  }
}

export const getProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return { success: false, message: "Not logged in" };
    }

    // Token should already be in axios.defaults, but just in case:
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const response = await axios.get("/api/auth/getProfile");

    return {
      success: true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch profile",
    };
  }
};

export const updateProfile = async (name) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return { success: false, message: "Not logged in" };
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const response = await axios.put("/api/auth/getProfile", { name });

    return {
      success: true,
      message: response.data.message,
      user: response.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile",
    };
  }
};

export const logoutUser = () => {
  // Remove JWT token from localStorage
  localStorage.removeItem("token");

  // Remove default Authorization header in Axios
  delete axios.defaults.headers.common["Authorization"];

  // Optionally, you can return a success message
  return { success: true, message: "Logged out successfully" };
};

export const deleteAccount = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return { success: false, message: "Not logged in" };
    }

    const response = await axios.delete(
      "http://localhost:5001/api/auth/delete",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Clear token after deletion
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete account",
    };
  }
};
