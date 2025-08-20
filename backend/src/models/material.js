// backend/src/models/material.js
import mongoose from "mongoose";
const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [Number], // index of chosen answers
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const MaterialSchema = new mongoose.Schema({
  userId: {
    //unique identifier for each document that is created in the database (this is done automatically by MongoDB)
    type: mongoose.Schema.Types.ObjectId,
    // reference to the User document (can be used to link materials to a specific user)
    ref: "User",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  materialType: {
    type: String,
    enum: ["flashcard", "quiz", "summary"],
    required: true,
  },
  content: { type: Object, required: true }, // stores cards, questions, or summary
  createdAt: { type: Date, default: Date.now },
  quizAttempts: [quizAttemptSchema], // array of quiz attempts
});

export default mongoose.model("Material", MaterialSchema);
