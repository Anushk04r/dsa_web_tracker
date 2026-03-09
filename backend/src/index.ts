import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import chatbotRoutes from "./routes/chatbot";
import problemsRoutes from "./routes/problems";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dsa-tracker";

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/problems", problemsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend-api" });
});

async function start() {
  try {
    if (!MONGO_URI || MONGO_URI === "mongodb://localhost:27017/dsa-tracker") {
      console.error("⚠️  ERROR: MONGO_URI not set in .env file!");
      console.error("Please set MONGO_URI in backend/.env");
      console.error("Options:");
      console.error("  1. MongoDB Atlas (cloud): mongodb+srv://username:password@cluster.mongodb.net/dsa-tracker");
      console.error("  2. Local MongoDB: mongodb://localhost:27017/dsa-tracker (requires MongoDB to be running)");
      process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`✅ Backend API listening on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });
  } catch (err: any) {
    console.error("❌ Failed to start backend");
    if (err.message?.includes("ECONNREFUSED")) {
      console.error("MongoDB connection refused. Possible issues:");
      console.error("  1. MongoDB is not running (if using local MongoDB)");
      console.error("  2. MONGO_URI is incorrect in backend/.env");
      console.error("  3. Network/firewall blocking connection");
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

start();


