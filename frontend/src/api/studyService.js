// frontend/src/api/dashboardService.js
import axios from "axios";

// Set base URL for all requests
axios.defaults.baseURL = "http://localhost:5001";

export const saveMaterialToDashboard = async (
  { fileName, materialType, content },
  token
) => {
  try {
    const response = await axios.post(
      "/api/dashboard/save-material",
      { fileName, materialType, content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error saving material:", err?.response?.data || err.message);
    throw new Error(err?.response?.data?.error || "Failed to save material");
  }
};

export const fetchMaterials = async (token) => {
  try {
    const response = await axios.get("/api/dashboard/get-materials", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error(
      "Error fetching materials:",
      err?.response?.data || err.message
    );
    throw new Error(err?.response?.data?.error || "Failed to fetch materials");
  }
};

export const deleteMaterial = async (materialId, token) => {
  try {
    const response = await axios.delete(
      `/api/dashboard/delete-material/${materialId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    console.error(
      "Error deleting material:",
      err?.response?.data || err.message
    );
    throw new Error(err?.response?.data?.error || "Failed to delete material");
  }
};

export const getMaterialById = async (materialId, token) => {
  try {
    const response = await axios.get(
      `/api/dashboard/get-material/${materialId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    console.error(
      "Error fetching material:",
      err?.response?.data || err.message
    );
    throw new Error(err?.response?.data?.error || "Failed to fetch material");
  }
};

export const updateMaterial = async (materialId, payload, token) => {
  try {
    const response = await axios.put(
      `/api/dashboard/update-material/${materialId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    console.error(
      "Error updating material:",
      err?.response?.data || err.message
    );
    throw new Error(err?.response?.data?.error || "Failed to update material");
  }
};

// export const submitQuizAttempt = async (materialId, answers, token) => {
//   try {
//     const response = await axios.post(
//       `/api/dashboard/submit-quiz-attempt/${materialId}`,
//       { answers },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       }
//     );
//     return response.data;
//   } catch (err) {
//     console.error(
//       "Error submitting quiz attempt:",
//       err?.response?.data || err.message
//     );
//     throw new Error(
//       err?.response?.data?.error || "Failed to submit quiz attempt"
//     );
//   }
// };

// export const getQuizAttempts = async (materialId, token) => {
//   try {
//     const response = await axios.get(
//       `/api/dashboard/quiz/quiz-attempts/${materialId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       }
//     );
//     return response.data;
//   } catch (err) {
//     console.error(
//       "Error fetching quiz attempts:",
//       err?.response?.data || err.message
//     );
//     throw new Error(
//       err?.response?.data?.error || "Failed to fetch quiz attempts"
//     );
//   }
// };
