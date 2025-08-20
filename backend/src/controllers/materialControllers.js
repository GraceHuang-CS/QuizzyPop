// backend/src/controllers/materialControllers.js
import Material from "../models/material.js";

export const saveMaterial = async (req, res) => {
  try {
    const { fileName, materialType, content } = req.body;

    if (!fileName || !materialType || !content) {
      return res
        .status(400)
        .json({ error: "fileName, materialType, and content are required" });
    }

    // Validate materialType
    const validTypes = ["flashcard", "quiz", "summary"];
    if (!validTypes.includes(materialType)) {
      return res.status(400).json({ error: "Invalid material type" });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: Missing user info" });
    }
    const material = await Material.create({
      userId: req.user._id, // set by auth middleware
      fileName,
      materialType,
      content,
    });

    res.status(201).json(material);
  } catch (err) {
    console.error("Failed to save material:", err);
    res.status(500).json({ error: "Failed to save material" });
  }
};

export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(materials);
  } catch (err) {
    console.error("Failed to get materials:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.json(material);
  } catch (err) {
    console.error("Failed to get material:", err);
    res.status(500).json({ error: "Failed to fetch material" });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Failed to delete material:", err);
    res.status(500).json({ error: "Failed to delete material" });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { fileName, materialType, content } = req.body;

    const material = await Material.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        ...(fileName && { fileName }),
        ...(materialType && { materialType }),
        ...(content && { content }),
      },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.json(material);
  } catch (err) {
    console.error("Failed to update material:", err);
    res.status(500).json({ error: "Failed to update material" });
  }
};
