import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
connectDB();
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}!✅`);
});
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", materialRoutes);
app.use("/api/dashboard/quiz", quizRoutes);
