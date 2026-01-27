const express = require("express");
const router = express.Router();
const Teacher = require("../Modals/Teacher");
const Student = require("../Modals/Student");

// ===============================
// GET TEACHER PROFILE
// ===============================
// GET TEACHER PROFILE (FIXED)
router.get("/me/:teacherId", async (req, res) => {
  try {
    const teacher = await Teacher.findOne(
      { id: req.params.teacherId },   // 🔥 FIX HERE
      "-password"
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (err) {
    console.error("❌ TEACHER PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// FETCH STUDENTS (SAFE)
// ===============================
router.get("/students", async (req, res) => {
  const { year, division } = req.query;

  const students = await Student.find(
    { year: String(year), division },
    "id name roll_no prn year division subjects lab"
  ).sort({ roll_no: 1 });

  res.json(students);
});



// ===============================
// FETCH LABS ASSIGNED TO TEACHER
// ===============================
router.get("/labs/:teacherId", async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ id: req.params.teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log("🧪 RAW teacher.lab =", teacher.lab);

    const labObj = teacher.lab || {};

    const labs = Object.keys(labObj).map((labName) => ({
      subject: labName,
      year: labObj[labName].year,
      division: teacher.divisions?.[0] || "B",
      batches: labObj[labName].sub_divisions || [],
      course_code: labObj[labName].course_code || "",
    }));

    res.json({ labs });
  } catch (err) {
    console.error("❌ TEACHER LAB ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
