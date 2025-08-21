import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  googleSignUp,
  deleteAccount,
} from "../controllers/authControllers.js";
import auth from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/google-signup", googleSignUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/getProfile", auth, getProfile);
router.put("/getProfile", auth, updateProfile);
router.delete("/delete", auth, deleteAccount);
export default router;
