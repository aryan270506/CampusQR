const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: false }, // parent login id
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }, // Plain text password (no hashing)

    // student details (from your JSON)
    prn: String,
    roll_no: String,
    year: Number,
    division: String,
    branch: String,
    subjects: [String],
    lab: [String],

    role: { type: String, default: "parent" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", ParentSchema);