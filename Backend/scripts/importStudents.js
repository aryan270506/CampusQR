const fs = require("fs");
const mongoose = require("mongoose");
const Student = require("../Modals/Student");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importStudents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (students)");

    const raw = fs.readFileSync("./studentsdata.json", "utf-8");
    const students = JSON.parse(raw);

    console.log(`📦 Found ${students.length} students in JSON file`);

    // ✅ CORRECT FIELD NAMES - matching your Student schema
    const docs = students.map((s) => ({
      id: s.id,              // ✅ 'id' not 'studentId'
      name: s.name,
      email: s.email || null,
      password: s.password,  // ✅ 'password' not 'passwordHash'
      prn: s.prn || "",
      roll_no: s.roll_no,    // ✅ 'roll_no' not 'rollNo'
      year: s.year || "",
      division: s.division || "",
      branch: s.branch || "",
      subjects: Array.isArray(s.subjects) ? s.subjects : [],
      lab: Array.isArray(s.lab) ? s.lab : [],  // ✅ 'lab' not 'labs'
      image: s.image || null
    }));

    // Delete existing students
    const deleteResult = await Student.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing students`);

    // Insert new students
    const insertResult = await Student.insertMany(docs, { ordered: false });
    console.log(`🎉 Imported ${insertResult.length} students successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Student import failed:");
    console.error("Message:", err.message);
    if (err.code === 11000) {
      console.error("Duplicate key error - check for duplicate student IDs");
    }
    console.error("Stack:", err.stack);
    process.exit(1);
  }
}

importStudents();