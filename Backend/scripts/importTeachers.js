const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Teacher = require("../Models/Teacher");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importTeachers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (teachers)");

    const raw = fs.readFileSync("./teacherdata.json", "utf-8");
    const teachers = JSON.parse(raw);

    const docs = await Promise.all(
      teachers.map(async (t) => ({
        teacherId: t.id,
        name: t.name,
        passwordHash: await bcrypt.hash(t.password, 10),

        years: t.years || [],
        divisions: t.divisions || [],
        subjects: t.subjects || {},
        courseCodes: t.course_codes || {},
        labs: t.lab || {},

        role: "teacher",
      }))
    );

    await Teacher.insertMany(docs, { ordered: false });

    console.log(`🎉 Imported ${docs.length} teachers`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Teacher import failed:", err.message);
    process.exit(1);
  }
}

importTeachers();

