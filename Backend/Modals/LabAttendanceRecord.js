const mongoose = require("mongoose");

const LabAttendanceRecordSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    teacherId: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    division: {
      type: String,
      required: true,
    },

    batch: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    presentStudents: [
      {
        studentId: String,
        scannedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LabAttendanceRecord",
  LabAttendanceRecordSchema
);
