const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,   // ADMIN001, ADMIN002...
      index: true
    },

    email: {
      type: String,
      required: true
      // ❌ NOT unique (avoid duplicate-key issues)
    },

    password: {
      type: String,
      required: true
    },

    branch: {
      type: String,
      required: true
    },

    role: {
      type: String,
      default: "admin"
    }
  },
  {
    collection: "admins",
    timestamps: true
  }
);

module.exports = mongoose.model("Admin", adminSchema);
