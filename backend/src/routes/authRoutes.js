import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
} from "../controllers/authControllers.js";
import auth from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/getProfile", auth, getProfile);
export default router;
