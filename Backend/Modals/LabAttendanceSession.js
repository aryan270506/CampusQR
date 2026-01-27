const mongoose = require("mongoose");

const labAttendanceSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },

  teacherId: { type: String, required: true },

  year: { type: Number, required: true },
  division: { type: String, required: true },
  batch: { type: String, required: true },   // 🔥 LAB ONLY
  subject: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

module.exports = mongoose.model(
  "LabAttendanceSession",
  labAttendanceSessionSchema
);
