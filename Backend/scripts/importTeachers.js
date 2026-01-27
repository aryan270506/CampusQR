const fs = require("fs");
const mongoose = require("mongoose");
const Teacher = require("../Modals/Teacher");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importTeachers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (teachers)");

    const raw = fs.readFileSync("./teacherdata.json", "utf-8");
    const teachers = JSON.parse(raw);

    console.log(`📦 Found ${teachers.length} teachers in JSON file`);

    // ✅ CORRECT FIELD NAMES - matching your Teacher schema
    const docs = teachers.map((t) => ({
      id: t.id,              // ✅ 'id' not 'teacherId'
      name: t.name,
      password: t.password,  // ✅ 'password' not 'passwordHash'

      years: Array.isArray(t.years) ? t.years : [],
      divisions: Array.isArray(t.divisions) ? t.divisions : [],
      subjects: typeof t.subjects === 'object' ? t.subjects : {},
      course_codes: typeof t.course_codes === 'object' ? t.course_codes : {},  // ✅ 'course_codes' not 'courseCodes'
      lab: typeof t.lab === 'object' ? t.lab : {},  // ✅ 'lab' not 'labs'
    }));

    // Delete existing teachers
    const deleteResult = await Teacher.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing teachers`);

    // Insert new teachers
    const insertResult = await Teacher.insertMany(docs, { ordered: false });
    console.log(`🎉 Imported ${insertResult.length} teachers successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Teacher import failed:");
    console.error("Message:", err.message);
    if (err.code === 11000) {
      console.error("Duplicate key error - check for duplicate teacher IDs");
    }
    console.error("Stack:", err.stack);
    process.exit(1);
  }
}

importTeachers();