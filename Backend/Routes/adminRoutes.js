const express = require("express");
const router = express.Router();

const Admin = require("../Modals/Admin");
const Student = require("../Modals/Student");
const Teacher = require("../Modals/Teacher");
const Parent = require("../Modals/Parent");

console.log("🔥 ADMIN ROUTES FILE LOADED");

// ===============================
// 🔥 UPLOAD PARENTS
// ===============================
router.post("/upload-parents", async (req, res) => {
  console.log("====================================");
  console.log("🔵 UPLOAD PARENTS ENDPOINT HIT!");
  console.log("====================================");

  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      console.log("❌ Data is not an array");
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected a JSON array.",
        error: "DATA_NOT_ARRAY"
      });
    }

    if (data.length === 0) {
      console.log("❌ Empty array");
      return res.status(400).json({
        success: false,
        message: "Parent list cannot be empty",
        error: "EMPTY_ARRAY"
      });
    }

    console.log(`✅ Received ${data.length} parents`);

    // 2️⃣ Validate required fields with detailed error reporting
    const errors = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const missingFields = [];
      
      if (!p.id) missingFields.push("id");
      if (!p.name) missingFields.push("name");
      if (!p.password) missingFields.push("password");
      
      if (missingFields.length > 0) {
        errors.push({
          index: i,
          parentId: p.id || "unknown",
          parentName: p.name || "unknown",
          missingFields: missingFields
        });
      }
    }

    if (errors.length > 0) {
      console.log(`❌ Validation errors found in ${errors.length} parents:`, errors);
      return res.status(400).json({
        success: false,
        message: `Found ${errors.length} parent(s) with missing required fields`,
        error: "MISSING_REQUIRED_FIELDS",
        details: errors
      });
    }

    console.log("✅ All parents have required fields");

    // 3️⃣ DELETE ALL EXISTING PARENTS
    console.log("🗑️ Deleting existing parents...");
    const deleteResult = await Parent.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} parents`);

    // 4️⃣ PREPARE DOCUMENTS
    console.log("📝 Preparing parent documents...");
    const parentsToInsert = data.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email || "",
      password: p.password,
      prn: p.prn || "",
      roll_no: p.roll_no || "",
      year: p.year ? Number(p.year) : 0,
      division: p.division || "",
      branch: p.branch || "",
      subjects: Array.isArray(p.subjects) ? p.subjects : [],
      lab: Array.isArray(p.lab) ? p.lab : [],
      role: "parent",
    }));

    console.log("✅ Documents prepared");

    // 5️⃣ INSERT INTO DATABASE
    console.log("💾 Inserting into database...");
    const insertResult = await Parent.insertMany(parentsToInsert, { ordered: false });
    console.log(`✅ Inserted ${insertResult.length} parents`);

    console.log("====================================");
    console.log("🎉 UPLOAD COMPLETE!");
    console.log("====================================");

    res.json({
      success: true,
      message: "Parents uploaded successfully",
      count: insertResult.length,
    });

  } catch (err) {
    console.log("====================================");
    console.error("❌ UPLOAD ERROR:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Stack:", err.stack);
    console.log("====================================");
    
    // Handle specific MongoDB errors
    let errorMessage = "Failed to upload parents";
    let errorCode = "UNKNOWN_ERROR";
    
    if (err.code === 11000) {
      errorMessage = "Duplicate parent ID found. Each parent must have a unique ID.";
      errorCode = "DUPLICATE_KEY";
    } else if (err.name === "ValidationError") {
      errorMessage = "Data validation failed: " + err.message;
      errorCode = "VALIDATION_ERROR";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorCode,
      details: err.message,
    });
  }
});

// ===============================
// 🔥 UPLOAD STUDENTS
// ===============================
router.post("/upload-students", async (req, res) => {
  console.log("====================================");
  console.log("🔵 UPLOAD STUDENTS ENDPOINT HIT!");
  console.log("====================================");

  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected a JSON array.",
        error: "DATA_NOT_ARRAY"
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student list cannot be empty",
        error: "EMPTY_ARRAY"
      });
    }

    console.log(`✅ Received ${data.length} students`);

    // 2️⃣ Validate required fields
    const errors = [];
    for (let i = 0; i < data.length; i++) {
      const s = data[i];
      const missingFields = [];
      
      if (!s.id) missingFields.push("id");
      if (!s.name) missingFields.push("name");
      if (!s.password) missingFields.push("password");
      
      if (missingFields.length > 0) {
        errors.push({
          index: i,
          studentId: s.id || "unknown",
          studentName: s.name || "unknown",
          missingFields: missingFields
        });
      }
    }

    if (errors.length > 0) {
      console.log(`❌ Validation errors found in ${errors.length} students:`, errors);
      return res.status(400).json({
        success: false,
        message: `Found ${errors.length} student(s) with missing required fields`,
        error: "MISSING_REQUIRED_FIELDS",
        details: errors
      });
    }

    console.log("✅ All students have required fields");

    // 3️⃣ DELETE ALL EXISTING STUDENTS 🔥
    console.log("🗑️ Deleting existing students...");
    const deleteResult = await Student.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} students`);

    // 4️⃣ PREPARE DOCUMENTS
    console.log("📝 Preparing student documents...");
    const studentsToInsert = data.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email || null,
      password: s.password,
      prn: s.prn || "",
      roll_no: s.roll_no || "",
      year: s.year || "",
      division: s.division || "",
      branch: s.branch || "",
      subjects: Array.isArray(s.subjects) ? s.subjects : [],
      lab: Array.isArray(s.lab) ? s.lab : [],
      image: s.image || null
    }));

    console.log("✅ Documents prepared");

    // 5️⃣ INSERT INTO DATABASE
    console.log("💾 Inserting into database...");
    const insertResult = await Student.insertMany(studentsToInsert, { ordered: false });
    console.log(`✅ Inserted ${insertResult.length} students`);

    console.log("====================================");
    console.log("🎉 UPLOAD COMPLETE!");
    console.log("====================================");

    res.json({
      success: true,
      message: "Students uploaded successfully",
      count: insertResult.length,
    });

  } catch (err) {
    console.error("❌ UPLOAD STUDENTS ERROR:", err);
    
    let errorMessage = "Failed to upload students";
    let errorCode = "UNKNOWN_ERROR";
    
    if (err.code === 11000) {
      errorMessage = "Duplicate student ID found. Each student must have a unique ID.";
      errorCode = "DUPLICATE_KEY";
    } else if (err.name === "ValidationError") {
      errorMessage = "Data validation failed: " + err.message;
      errorCode = "VALIDATION_ERROR";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorCode,
      details: err.message,
    });
  }
});

// ===============================
// 🔥 UPLOAD TEACHERS
// ===============================
router.post("/upload-teachers", async (req, res) => {
  console.log("====================================");
  console.log("🔵 UPLOAD TEACHERS ENDPOINT HIT!");
  console.log("====================================");

  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected a JSON array.",
        error: "DATA_NOT_ARRAY"
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Teacher list cannot be empty",
        error: "EMPTY_ARRAY"
      });
    }

    console.log(`✅ Received ${data.length} teachers`);

    // 2️⃣ Validate required fields
    const errors = [];
    for (let i = 0; i < data.length; i++) {
      const t = data[i];
      const missingFields = [];
      
      if (!t.id) missingFields.push("id");
      if (!t.name) missingFields.push("name");
      if (!t.password) missingFields.push("password");
      
      if (missingFields.length > 0) {
        errors.push({
          index: i,
          teacherId: t.id || "unknown",
          teacherName: t.name || "unknown",
          missingFields: missingFields
        });
      }
    }

    if (errors.length > 0) {
      console.log(`❌ Validation errors found in ${errors.length} teachers:`, errors);
      return res.status(400).json({
        success: false,
        message: `Found ${errors.length} teacher(s) with missing required fields`,
        error: "MISSING_REQUIRED_FIELDS",
        details: errors
      });
    }

    console.log("✅ All teachers have required fields");

    // 3️⃣ DELETE ALL TEACHERS 🔥
    console.log("🗑️ Deleting existing teachers...");
    const deleteResult = await Teacher.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} teachers`);

    // 4️⃣ PREPARE DOCUMENTS
    console.log("📝 Preparing teacher documents...");
    const teachersToInsert = data.map(t => ({
      id: t.id,
      name: t.name,
      password: t.password,
      years: Array.isArray(t.years) ? t.years : [],
      divisions: Array.isArray(t.divisions) ? t.divisions : [],
      subjects: typeof t.subjects === 'object' ? t.subjects : {},
      course_codes: typeof t.course_codes === 'object' ? t.course_codes : {},
      lab: typeof t.lab === 'object' ? t.lab : {},
    }));

    console.log("✅ Documents prepared");

    // 5️⃣ INSERT INTO DATABASE
    console.log("💾 Inserting into database...");
    const insertResult = await Teacher.insertMany(teachersToInsert, { ordered: false });
    console.log(`✅ Inserted ${insertResult.length} teachers`);

    console.log("====================================");
    console.log("🎉 UPLOAD COMPLETE!");
    console.log("====================================");

    res.json({
      success: true,
      message: "Teachers uploaded successfully",
      count: insertResult.length,
    });

  } catch (err) {
    console.error("❌ UPLOAD TEACHERS ERROR:", err);
    
    let errorMessage = "Failed to upload teachers";
    let errorCode = "UNKNOWN_ERROR";
    
    if (err.code === 11000) {
      errorMessage = "Duplicate teacher ID found. Each teacher must have a unique ID.";
      errorCode = "DUPLICATE_KEY";
    } else if (err.name === "ValidationError") {
      errorMessage = "Data validation failed: " + err.message;
      errorCode = "VALIDATION_ERROR";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorCode,
      details: err.message,
    });
  }
});

// ===============================
// 🔥 UPLOAD ADMINS
// ===============================
router.post("/upload-admins", async (req, res) => {
  console.log("====================================");
  console.log("🔵 UPLOAD ADMINS ENDPOINT HIT!");
  console.log("====================================");

  try {
    const data = req.body;

    // 1️⃣ Validate JSON array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected a JSON array.",
        error: "DATA_NOT_ARRAY"
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Admin list cannot be empty",
        error: "EMPTY_ARRAY"
      });
    }

    console.log(`✅ Received ${data.length} admins`);

    // 2️⃣ Validate required fields
    const errors = [];
    for (let i = 0; i < data.length; i++) {
      const a = data[i];
      const missingFields = [];
      
      if (!a.id) missingFields.push("id");
      if (!a.password) missingFields.push("password");
      if (!a.email) missingFields.push("email");
      if (!a.branch) missingFields.push("branch");
      
      if (missingFields.length > 0) {
        errors.push({
          index: i,
          adminId: a.id || "unknown",
          missingFields: missingFields
        });
      }
    }

    if (errors.length > 0) {
      console.log(`❌ Validation errors found in ${errors.length} admins:`, errors);
      return res.status(400).json({
        success: false,
        message: `Found ${errors.length} admin(s) with missing required fields`,
        error: "MISSING_REQUIRED_FIELDS",
        details: errors
      });
    }

    console.log("✅ All admins have required fields");

    // 3️⃣ DELETE ALL DB ADMINS (NOT SUPERADMIN)
    console.log("🗑️ Deleting existing admins...");
    const deleteResult = await Admin.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} admins`);

    // 4️⃣ PREPARE DOCUMENTS
    console.log("📝 Preparing admin documents...");
    const adminsToInsert = data.map(a => ({
      id: a.id,
      email: a.email,
      password: a.password,
      branch: a.branch,
      role: "admin"
    }));

    console.log("✅ Documents prepared");

    // 5️⃣ INSERT INTO DATABASE
    console.log("💾 Inserting into database...");
    const insertResult = await Admin.insertMany(adminsToInsert, { ordered: false });
    console.log(`✅ Inserted ${insertResult.length} admins`);

    console.log("====================================");
    console.log("🎉 UPLOAD COMPLETE!");
    console.log("====================================");

    res.json({
      success: true,
      message: "Admins uploaded successfully",
      count: insertResult.length,
    });

  } catch (err) {
    console.error("❌ UPLOAD ADMINS ERROR:", err);
    
    let errorMessage = "Failed to upload admins";
    let errorCode = "UNKNOWN_ERROR";
    
    if (err.code === 11000) {
      errorMessage = "Duplicate admin ID found. Each admin must have a unique ID.";
      errorCode = "DUPLICATE_KEY";
    } else if (err.name === "ValidationError") {
      errorMessage = "Data validation failed: " + err.message;
      errorCode = "VALIDATION_ERROR";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorCode,
      details: err.message,
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
      return res.status(401).json({ 
        success: false,
        message: "Invalid admin ID" 
      });
    }

    if (admin.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid password" 
      });
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
    return res.status(500).json({ 
      success: false,
      message: "Login failed",
      error: err.message 
    });
  }
});

// =======================
// ALTERNATIVE LOGIN ROUTE
// =======================
router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const admin = await Admin.findOne({ id });

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid admin ID" 
      });
    }

    if (admin.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid password" 
      });
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
    return res.status(500).json({ 
      success: false,
      message: "Login failed",
      error: err.message 
    });
  }
});

// =======================
// GET STUDENTS
// =======================
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
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch students",
      error: err.message 
    });
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
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    res.json(admin);

  } catch (err) {
    console.error("❌ ADMIN PROFILE ERROR:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
});

// =======================
// HEALTH CHECK
// =======================
router.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "ADMIN ROUTES OK",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;