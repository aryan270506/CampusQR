const express = require("express");
const router = express.Router();

const Student = require("../Modals/Student");
const Teacher = require("../Modals/Teacher");
const Admin = require("../Modals/Admin");
const Parent = require("../Modals/Parent");
const bcrypt = require("bcryptjs");

// =======================
// STUDENT LOGIN
// =======================
router.post("/student/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const student = await Student.findOne({ id });
    if (!student) {
      return res.status(401).json({ message: "Invalid student ID" });
    }

    if (student.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.json({
      success: true,
      role: "student",
      id: student.id,
      name: student.name,
      year: student.year,
      division: student.division,
      branch: student.branch
    });
  } catch (err) {
    console.error("❌ STUDENT LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

// =======================
// TEACHER LOGIN
// =======================
router.post("/teacher/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ id });
    if (!teacher) {
      return res.status(401).json({ message: "Invalid teacher ID" });
    }

    if (teacher.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.json({
      success: true,
      role: "teacher",
      id: teacher.id,
      name: teacher.name,
      years: teacher.years,
      divisions: teacher.divisions
    });
  } catch (err) {
    console.error("❌ TEACHER LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

// ===============================
// 🔹 PARENT LOGIN (NO PASSWORD HASHING)
// ===============================
router.post("/parent-login", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ message: "ID and password are required" });
    }

    // Find parent by ID
    const parent = await Parent.findOne({ id });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Direct password comparison (no hashing)
    if (parent.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`✅ Parent logged in: ${parent.name} (${parent.id})`);

    // Return parent data (excluding password)
    res.json({
      success: true,
      message: "Login successful",
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        prn: parent.prn,
        roll_no: parent.roll_no,
        year: parent.year,
        division: parent.division,
        branch: parent.branch,
        subjects: parent.subjects,
        lab: parent.lab,
        role: parent.role,
      },
    });
  } catch (err) {
    console.error("❌ PARENT LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Login failed" });
  }
});


// =======================
// ADMIN LOGIN
// =======================
router.post("/admin/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    // 🔐 STATIC SUPER ADMIN (BOOTSTRAP)
    if (id === "SUPERADMIN" && password === "admin@123") {
      return res.json({
        success: true,
        role: "admin",
        id: "SUPERADMIN",
        email: "superadmin@system.local",
        branch: "ALL",
      });
    }

    // 🔎 NORMAL DB ADMIN LOGIN
    const admin = await Admin.findOne({ id });

    if (!admin) {
      return res.status(401).json({ message: "Invalid admin ID" });
    }

    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.json({
      success: true,
      role: "admin",
      id: admin.id,
      email: admin.email,
      branch: admin.branch,
    });
  } catch (err) {
    console.error("❌ ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
