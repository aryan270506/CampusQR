const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,   // matches your "id"
      index: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      default: null   // ❗ do NOT make unique (many may be empty)
    },

    password: {
      type: String,
      required: true  // plain for now (hash later)
    },

    prn: {
      type: String
    },

    roll_no: {
      type: String
    },

    year: {
      type: String    // kept string because JSON has "1"
    },

    division: {
      type: String
    },

    branch: {
      type: String
    },

    subjects: {
      type: [String],
      default: []
    },
    

    lab: {
      type: [String],
      default: []
    },
    image: {                 // ✅ ADD THIS
    type: String,
    default: null
  }
  },
  {
    collection: "students", // force same collection
    timestamps: true
  },
  
);

module.exports = mongoose.model("Student", studentSchema);
