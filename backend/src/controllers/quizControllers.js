//quiz controllers
import Material from "../models/material.js";

export const saveQuizAttempt = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { answers } = req.body; // array of selected option indices
    const userId = req.user.userId;

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    if (material.materialType !== "quiz") {
      return res.status(400).json({ error: "Material is not a quiz" });
    }

    // Calculate score
    let score = 0;
    const questions = material.content.questions;
    answers.forEach((answer, index) => {
      if (questions[index] && questions[index].correctAnswer === answer) {
        score++;
      }
    });

    // Create quiz attempt
    const quizAttempt = {
      userId,
      answers,
      score,
      createdAt: new Date(),
    };

    material.quizAttempts.push(quizAttempt);
    await material.save();

    res.json({
      success: true,
      attempt: quizAttempt,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    res.status(500).json({ error: "Failed to submit quiz attempt" });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.userId;

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    const userAttempts = material.quizAttempts.filter(
      (attempt) => attempt.userId.toString() === userId
    );

    res.json(userAttempts);
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    res.status(500).json({ error: "Failed to fetch quiz attempts" });
  }
};
