const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../Modals/Student");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importStudents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (students)");

    const raw = fs.readFileSync("./studentsdata.json", "utf-8");
    const students = JSON.parse(raw);

    const docs = await Promise.all(
      students.map(async (s) => ({
        studentId: s.id,
        name: s.name,
        email: s.email,
        passwordHash: await bcrypt.hash(s.password, 10),
        prn: s.prn,
        rollNo: s.roll_no,
        year: Number(s.year),
        division: s.division,
        branch: s.branch,
        subjects: s.subjects || [],
        labs: s.lab || [],
        role: "student",
      }))
    );

    await Student.insertMany(docs, { ordered: false });

    console.log(`🎉 Imported ${docs.length} students`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Student import failed:", err.message);
    process.exit(1);
  }
}

importStudents();
