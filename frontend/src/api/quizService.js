import axios from "axios";

export const submitQuizAttempt = async (materialId, answers, token) => {
  try {
    const response = await axios.post(
      `/api/dashboard/submit-quiz-attempt/${materialId}`,
      { answers },
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
      "Error submitting quiz attempt:",
      err?.response?.data || err.message
    );
    throw new Error(
      err?.response?.data?.error || "Failed to submit quiz attempt"
    );
  }
};

export const getQuizAttempts = async (materialId, token) => {
  try {
    const response = await axios.get(
      `/api/dashboard/quiz/quiz-attempts/${materialId}`,
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
      "Error fetching quiz attempts:",
      err?.response?.data || err.message
    );
    throw new Error(
      err?.response?.data?.error || "Failed to fetch quiz attempts"
    );
  }
};
