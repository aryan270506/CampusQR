const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    years: {
      type: [Number],
      default: []
    },

    divisions: {
      type: [String],
      default: []
    },

    subjects: {
      type: Object,
      default: {}
    },

    course_codes: {
      type: Object,
      default: {}
    },

    // ✅ THIS WAS THE MISSING PIECE
    lab: {
      type: Object,
      default: {}
    }
  },
  {
    collection: "teachers",
    timestamps: true
  }
);

module.exports = mongoose.model("Teacher", teacherSchema);
