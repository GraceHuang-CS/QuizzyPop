// backend/src/routes/quizRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  saveQuizAttempt,
  getQuizAttempts,
} from "../controllers/quizControllers.js";

const router = express.Router();

router.post("/submit-quiz-attempt/:materialId", auth, saveQuizAttempt);
router.get("/quiz-attempts/:materialId", auth, getQuizAttempts);
export default router;
