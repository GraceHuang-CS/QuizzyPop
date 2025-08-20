// backend/src/routes/materialRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  getMaterials,
  getMaterialById,
  saveMaterial,
  deleteMaterial,
  updateMaterial,
} from "../controllers/materialControllers.js";

const router = express.Router();

// Save a new material
router.post("/save-material", auth, saveMaterial);

// Get all materials for a user
router.get("/get-materials", auth, getMaterials);

// Get a specific material by ID
router.get("/get-material/:id", auth, getMaterialById);

// Update a material
router.put("/update-material/:id", auth, updateMaterial);

// Delete a material
router.delete("/delete-material/:id", auth, deleteMaterial);

export default router;
