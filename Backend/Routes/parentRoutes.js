const express = require("express");
const router = express.Router();
const Parent = require("../Modals/Parent");

/*
|--------------------------------------------------------------------------
| GET PARENT PROFILE
|--------------------------------------------------------------------------
| GET /api/parent/profile/:id
*/
router.get("/profile/:id", async (req, res) => {
  try {
    const parent = await Parent.findOne({ id: req.params.id }).select(
      "-password" // Hide password in response
    );

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json({
      success: true,
      parent,
    });
  } catch (err) {
    console.error("❌ FETCH PARENT PROFILE ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch parent profile" });
  }
});

/*
|--------------------------------------------------------------------------
| GET STUDENT INFO (FOR PARENT DASHBOARD)
|--------------------------------------------------------------------------
| GET /api/parent/student/:id
*/
router.get("/student/:id", async (req, res) => {
  try {
    const parent = await Parent.findOne({ id: req.params.id });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json({
      success: true,
      student: {
        name: parent.name,
        prn: parent.prn,
        roll_no: parent.roll_no,
        year: parent.year,
        division: parent.division,
        branch: parent.branch,
        subjects: parent.subjects,
        lab: parent.lab,
      },
    });
  } catch (err) {
    console.error("❌ FETCH STUDENT DATA ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch student data" });
  }
});

module.exports = router;