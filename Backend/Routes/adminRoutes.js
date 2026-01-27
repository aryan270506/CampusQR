const express = require("express");
const router = express.Router();

const Admin = require("../Modals/Admin");
const Student = require("../Modals/Student");
const Teacher = require("../Modals/Teacher");
const Parent = require("../Modals/Parent");
const bcrypt = require("bcryptjs");


console.log("🔥 ADMIN ROUTES FILE LOADED");

// ===============================
// 🔥 UPLOAD PARENTS - NO PASSWORD HASHING
// ===============================
router.post("/upload-parents", async (req, res) => {
  console.log("====================================");
  console.log("🔵 UPLOAD PARENTS ENDPOINT HIT!");
  console.log("====================================");
  console.log("📦 Received data:", {
    type: typeof req.body,
    isArray: Array.isArray(req.body),
    length: req.body?.length
  });

  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      console.log("❌ Data is not an array");
      return res.status(400).json({
        success: false,
        message: "Invalid data format. JSON array required.",
      });
    }

    if (data.length === 0) {
      console.log("❌ Empty array");
      return res.status(400).json({
        success: false,
        message: "Parent list cannot be empty",
      });
    }

    console.log(`✅ Received ${data.length} parents`);

    // 2️⃣ Validate required fields
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (!p.id || !p.name || !p.password) {
        console.log(`❌ Missing fields at index ${i}:`, p);
        return res.status(400).json({
          success: false,
          message: `Parent at index ${i} missing required fields`,
        });
      }
    }
    console.log("✅ All parents have required fields");

    // 🔥 3️⃣ DELETE ALL EXISTING PARENTS
    console.log("🗑️ Deleting existing parents...");
    const deleteResult = await Parent.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} parents`);

    // 4️⃣ PREPARE DOCUMENTS (NO HASHING)
    console.log("📝 Preparing parent documents...");
    const parentsToInsert = data.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      password: p.password, // ✅ Store password as-is (no hashing)

      prn: p.prn,
      roll_no: p.roll_no,
      year: Number(p.year),
      division: p.division,
      branch: p.branch,
      subjects: p.subjects || [],
      lab: p.lab || [],

      role: "parent",
    }));

    console.log("✅ Documents prepared");

    // 5️⃣ INSERT INTO DATABASE
    console.log("💾 Inserting into database...");
    const insertResult = await Parent.insertMany(parentsToInsert);
    console.log(`✅ Inserted ${insertResult.length} parents`);

    console.log("====================================");
    console.log("🎉 UPLOAD COMPLETE!");
    console.log("====================================");

    res.json({
      success: true,
      message: "Parents uploaded successfully",
      count: parentsToInsert.length,
    });

  } catch (err) {
    console.log("====================================");
    console.error("❌ UPLOAD ERROR:");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.log("====================================");
    
    res.status(500).json({
      success: false,
      message: "Failed to upload parents",
      error: err.message,
    });
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
        branch: "ALL"
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
      branch: admin.branch
    });

  } catch (err) {
    console.error("❌ ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/upload-students", async (req, res) => {
  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid data format. JSON array required.",
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        message: "Student list cannot be empty",
      });
    }

    // 2️⃣ Validate required fields
    for (const s of data) {
      if (!s.id || !s.name || !s.password) {
        return res.status(400).json({
          message: "Each student must have id, name, and password",
        });
      }
    }

    // 3️⃣ DELETE ALL EXISTING STUDENTS 🔥
    await Student.deleteMany({});
    console.log("🗑️ All old students deleted");

    // 4️⃣ INSERT NEW STUDENTS
    await Student.insertMany(data);
    console.log(`✅ ${data.length} students inserted`);

    res.json({
      success: true,
      message: "Students uploaded successfully",
      count: data.length,
    });

  } catch (err) {
    console.error("❌ UPLOAD STUDENTS ERROR:", err);
    res.status(500).json({
      message: "Failed to upload students",
    });
  }
});

router.get("/ping", (req, res) => {
  res.send("ADMIN ROUTES OK");
});

router.get("/students", async (req, res) => {
  const { year, division } = req.query;

  try {
    const query = {};
    if (year) query.year = year;
    if (division) query.division = division;

    const students = await Student.find(query).select("-password");

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (err) {
    console.error("❌ FETCH STUDENTS ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});


// =======================
// ADMIN LOGIN
// =======================
router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const admin = await Admin.findOne({ id });

    if (!admin) {
      return res.status(401).json({ message: "Invalid admin ID" });
    }

    // ⚠️ Plain-text check (temporary)
    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.json({
      success: true,
      role: "admin",
      id: admin.id,
      email: admin.email,
      branch: admin.branch
    });
  } catch (err) {
    console.error("❌ ADMIN LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

// =======================
// ADMIN PROFILE
// =======================
router.get("/me/:id", async (req, res) => {
  try {
    const adminId = req.params.id;

    // 🔐 STATIC SUPER ADMIN PROFILE
    if (adminId === "SUPERADMIN") {
      return res.json({
        id: "SUPERADMIN",
        email: "superadmin@system.local",
        branch: "ALL",
        role: "admin",
      });
    }

    // 🔎 NORMAL DB ADMIN
    const admin = await Admin.findOne(
      { id: adminId },
      "-password"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);

  } catch (err) {
    console.error("❌ ADMIN PROFILE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// 🔥 UPLOAD ADMINS (JSON ONLY)
// ===============================
router.post("/upload-admins", async (req, res) => {
  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid data format. JSON array required",
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        message: "Admin list cannot be empty",
      });
    }

    // 2️⃣ Validate required fields
    for (const a of data) {
      if (!a.id || !a.password || !a.email || !a.branch) {
        return res.status(400).json({
          message: "Each admin must have id, email, password, branch",
        });
      }
    }

    // 3️⃣ DELETE ALL REAL ADMINS (NOT SUPERADMIN)
    await Admin.deleteMany({});
    console.log("🗑️ All DB admins deleted");

    // 4️⃣ INSERT NEW ADMINS
    await Admin.insertMany(
      data.map(a => ({
        id: a.id,
        email: a.email,
        password: a.password, // (plain for now)
        branch: a.branch,
        role: "admin"
      }))
    );

    console.log(`✅ ${data.length} admins inserted`);

    res.json({
      success: true,
      message: "Admins uploaded successfully",
      count: data.length,
    });

  } catch (err) {
    console.error("❌ UPLOAD ADMINS ERROR:", err);
    res.status(500).json({
      message: "Failed to upload admins",
    });
  }
});



// ===============================
// 🔥 UPLOAD TEACHERS (JSON ONLY)
// ===============================
router.post("/upload-teachers", async (req, res) => {
  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid data format. JSON array required",
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        message: "Teacher list cannot be empty",
      });
    }

    // 2️⃣ Validate required fields
    for (const t of data) {
      if (!t.id || !t.name || !t.password) {
        return res.status(400).json({
          message: "Each teacher must have id, name, and password",
        });
      }
    }

    // 3️⃣ DELETE ALL TEACHERS 🔥
    await Teacher.deleteMany({});
    console.log("🗑️ All teachers deleted");

    // 4️⃣ INSERT NEW TEACHERS
    await Teacher.insertMany(
      data.map(t => ({
        id: t.id,
        name: t.name,
        password: t.password, // (plain for now)
        years: t.years || [],
        divisions: t.divisions || [],
        subjects: t.subjects || {},
        course_codes: t.course_codes || {},
        lab: t.lab || {},
      }))
    );

    console.log(`✅ ${data.length} teachers inserted`);

    res.json({
      success: true,
      message: "Teachers uploaded successfully",
      count: data.length,
    });

  } catch (err) {
    console.error("❌ UPLOAD TEACHERS ERROR:", err);
    res.status(500).json({
      message: "Failed to upload teachers",
    });
  }
});



module.exports = router;
