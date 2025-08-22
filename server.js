import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import freelancerRoutes from "./routes/freelanceUserRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversations.js"; // standardized
import { setupSocket } from "./realtime/socket.js";
import { protect } from "./middlewares/authMiddleware.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
  origin: [
    "http://localhost:5173",
    "https://freelynx.vercel.app",
    "https://freelynx-git-main-sudipta-khanras-projects.vercel.app"
  ],
  credentials: true,
})

);

// Static files
app.use("/uploads", express.static(path.resolve("uploads")));

// Health check
app.get("/", (req, res) => res.send("✅ API is running..."));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/conversations", protect, conversationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌", err.stack);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong!" });
});

// HTTP server
const server = http.createServer(app);

// Connect DB and start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    setupSocket(server); // attach Socket.io AFTER server is created
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ Failed to connect to DB:", err));

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  server.close(() => process.exit(0));
});
