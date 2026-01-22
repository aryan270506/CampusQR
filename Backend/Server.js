const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const initSocket = require("./Socket");

const userRoutes = require("./Routes/userRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes"); // ✅ ADD THIS
const cors = require("cors");

const app = express();

/* ===============================
   🔹 CORS (🔥 REQUIRED FOR WEB)
================================ */
app.use(cors({
  origin: "*", // ✅ allow all for development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

/* ===============================
   🔹 GLOBAL REQUEST LOGGER
================================ */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📡 [${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

// Middleware
app.use(express.json());

/* ===============================
   🔹 MONGODB CONNECTION
================================ */
const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// MongoDB event logs
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  console.log("🔴 MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err);
});

/* ===============================
   🔹 BASIC ROUTE
================================ */
app.get("/", (req, res) => {
  console.log("🏠 Root route accessed");
  res.send("Attendance Backend Running");
});

/* ===============================
   🔹 API ROUTES
================================ */
app.use("/api/users", userRoutes);           // user login/logout
app.use("/api/attendance", attendanceRoutes); // ✅ attendance system

/* ===============================
   🔹 HTTP + SOCKET SERVER
================================ */
const server = http.createServer(app);

// Attach Socket.IO
initSocket(server);

/* ===============================
   🔹 SERVER START
================================ */
const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
