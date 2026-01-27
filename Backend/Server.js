const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");

const initSocket = require("./Socket");

// ===============================
// 🔹 ROUTES
// ===============================
const userRoutes = require("./Routes/userRoutes");                 // socket presence
const authRoutes = require("./Routes/authRoutes");                 // student / teacher / admin login
const studentRoutes = require("./Routes/studentRoutes");           // student APIs
const teacherRoutes = require("./Routes/teacherRoutes");           // teacher APIs
const adminRoutes = require("./Routes/adminRoutes");               // admin APIs
const attendanceRoutes = require("./Routes/attendanceRoutes");     // theory attendance
const labAttendanceRoutes = require("./Routes/labAttendanceRoutes"); // lab attendance
const parentRoutes = require("./Routes/parentRoutes");              // parent APIs

const app = express();

/* ===============================
   🔹 CORS (WEB + MOBILE)
================================ */
app.use(
  cors({
    origin: "*", // ⚠️ restrict in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

/* ===============================
   🔹 BODY PARSER
================================ */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use("/uploads", express.static("uploads"));



/* ===============================
   🔹 MONGODB CONNECTION
================================ */
const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  console.log("🔴 MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err.message);
});

/* ===============================
   🔹 ROOT HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("🚀 Attendance Backend Running");
});

/* ===============================
   🔹 API ROUTES
================================ */

// 🔐 AUTH (MongoDB-based login for all roles)
app.use("/api/auth", authRoutes);

// 🟢 USER PRESENCE / SOCKET TRACKING
app.use("/api/users", userRoutes);

// 🎓 STUDENT APIs
app.use("/api/student", studentRoutes);

// 👨‍🏫 TEACHER APIs
app.use("/api/teacher", teacherRoutes);

// 🧑‍💼 ADMIN APIs
app.use("/api/admin", adminRoutes);

// 📘 THEORY ATTENDANCE
app.use("/api/attendance", attendanceRoutes);

// 🧪 LAB ATTENDANCE
app.use("/api/lab-attendance", labAttendanceRoutes);

// 👨‍👩‍👧 PARENT APIs
app.use("/api/parent", parentRoutes);


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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
