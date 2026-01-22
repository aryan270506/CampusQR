const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    socketId: { type: String },
    loginTime: { type: Date },
    logoutTime: { type: Date },
    status: {
      type: String,
      enum: ["active", "deactivated"],
      default: "deactivated",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
