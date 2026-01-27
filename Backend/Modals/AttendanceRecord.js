const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true, // 🔥 one record per session
  },

  presentStudents: [
    {
      studentId: { type: String, required: true },
      scannedAt: { type: Date, default: Date.now },
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model(
  "AttendanceRecord",
  attendanceRecordSchema
);
