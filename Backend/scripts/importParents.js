const fs = require("fs");
const mongoose = require("mongoose");
const Parent = require("../Modals/Parent");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importParents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (parents)");

    const raw = fs.readFileSync("./parentsdata.json", "utf-8");
    const parents = JSON.parse(raw);

    console.log(`📦 Found ${parents.length} parents in JSON file`);

    // ✅ PREPARE DOCUMENTS - NO HASHING, CORRECT FIELD NAMES
    const parentsDocs = parents.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email || "",
      password: p.password, // Store plain password (matching your schema)

      prn: p.prn || "",
      roll_no: p.roll_no || "",
      year: p.year ? Number(p.year) : 0,
      division: p.division || "",
      branch: p.branch || "",
      subjects: Array.isArray(p.subjects) ? p.subjects : [],
      lab: Array.isArray(p.lab) ? p.lab : [],

      role: "parent",
    }));

    // Delete existing parents
    const deleteResult = await Parent.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing parents`);

    // Insert new parents
    const insertResult = await Parent.insertMany(parentsDocs, { ordered: false });
    console.log(`🎉 Imported ${insertResult.length} parents successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Parent import failed:");
    console.error("Message:", err.message);
    if (err.code === 11000) {
      console.error("Duplicate key error - check for duplicate parent IDs");
    }
    console.error("Stack:", err.stack);
    process.exit(1);
  }
}

importParents();