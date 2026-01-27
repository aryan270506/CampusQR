const express = require("express");
const router = express.Router();
const Student = require("../Modals/Student");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.params.studentId}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// ===============================
// SPECIFIC ROUTES FIRST (More specific paths go before generic ones)
// ===============================

// GET MY PROFILE (student) - /me/:studentId
router.get("/me/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne(
      { id: req.params.studentId },
      "-password"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Extract sub-branch from roll_no (FY-A1-02 → A1)
    let subBranch = null;
    if (student.roll_no) {
      const parts = student.roll_no.split("-");
      if (parts.length >= 2) {
        subBranch = parts[1];
      }
    }

    res.json({
      ...student.toObject(),
      subBranch, // ✅ send to frontend
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE PROFILE IMAGE
router.delete("/profile-image/:studentId", async (req, res) => {
  console.log("🔥 DELETE PROFILE IMAGE HIT:", req.params.studentId);
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.studentId },
      { image: null },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Profile image removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove image" });
  }
});

// UPDATE PROFILE IMAGE
router.put("/profile-image/:studentId", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const student = await Student.findOneAndUpdate(
      { id: req.params.studentId },
      { image },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Image saved in DB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save image" });
  }
});

// UPLOAD PROFILE IMAGE
router.post(
  "/upload-profile/:studentId",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const student = await Student.findOneAndUpdate(
        { id: req.params.studentId },
        { image: req.file.filename },
        { new: true }
      );

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({
        message: "Profile image uploaded successfully",
        image: req.file.filename
      });

    } catch (err) {
      console.error("❌ IMAGE UPLOAD ERROR:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// ===============================
// GET STUDENTS BY YEAR AND DIVISION (Query params route)
// Must come before /:studentId to avoid conflicts
// ===============================
router.get("/", async (req, res) => {
  try {
    const { year, division } = req.query;

    // If query params exist, return filtered students
    if (year && division) {
      console.log(`🔍 GET / with query - Fetching students: year=${year}, division=${division}`);
      
      const students = await Student.find(
        { year: String(year), division },
        "id name roll_no prn year division subjects lab"
      ).sort({ roll_no: 1 });

      console.log(`✅ Found ${students.length} students`);
      return res.json(students);
    }

    // If no query params, return error
    return res.status(400).json({ 
      message: "Year and division query parameters are required" 
    });
    
  } catch (err) {
    console.error("❌ STUDENTS FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// GET SINGLE STUDENT BY ID (Generic param route)
// Must come LAST to avoid catching other routes
// ===============================
router.get("/:studentId", async (req, res) => {
  try {
    console.log("🔍 GET /:studentId - Fetching student:", req.params.studentId);
    
    const student = await Student.findOne(
      { id: req.params.studentId },
      "-password" // Exclude password from response
    );

    if (!student) {
      console.log("❌ Student not found in DB:", req.params.studentId);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("✅ Student found:", student.name);
    res.json(student);
  } catch (err) {
    console.error("❌ STUDENT FETCH ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;