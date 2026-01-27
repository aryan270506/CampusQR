const express = require("express");
const LabAttendanceSession = require("../Modals/LabAttendanceSession");
const LabAttendanceRecord = require("../Modals/LabAttendanceRecord");

const router = express.Router();

router.get("/sessions", async (req, res) => {
  try {
    const { year, division } = req.query;
    
    const sessions = await LabAttendanceSession.find({
      year: Number(year),
      division: String(division),
    }).sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (err) {
    console.error("❌ Fetch lab sessions failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   CREATE LAB SESSION
================================ */
router.post("/session/create", async (req, res) => {
  try {
    console.log("🧪 CREATE LAB SESSION →", req.body);

    const { teacherId, year, division, batch, subject } = req.body;

    if (!teacherId || !year || !division || !batch || !subject) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const sessionId = `LAB_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 1️⃣ CREATE SESSION
    await LabAttendanceSession.create({
      sessionId,
      teacherId,
      year,
      division,
      batch,
      subject,
      expiresAt,
    });

    // 2️⃣ CREATE EMPTY ATTENDANCE RECORD
    await LabAttendanceRecord.create({
      sessionId,
      teacherId,
      year,
      division,
      batch,
      subject,
      presentStudents: [],
    });

    console.log("✅ Lab session + empty attendance record created:", sessionId);

    res.json({ sessionId, expiresAt });
  } catch (err) {
    console.error("❌ Lab session creation failed:", err);
    res.status(500).json({ error: err.message });
  }
});


/* =====================================================
   🧪 STUDENT LAB ATTENDANCE SUMMARY - FIXED
===================================================== */
router.post("/student-summary", async (req, res) => {
  try {
    const { studentId, year, division, labs } = req.body;

    console.log("🧪 Lab summary request:", { studentId, year, division, labs });

    const result = [];

    for (const lab of labs) {
      const labName = lab.name;     // "Software Engineering Lab"
      const studentBatch = lab.batch;      // "B3" or "C1" etc. 🔥 IMPORTANT

      console.log(`📊 Processing lab: ${labName}, student batch: ${studentBatch}`);

      if (!studentBatch) {
        console.log(`⚠️ No batch provided for ${labName}, skipping...`);
        result.push({
          subject: labName,
          total: 0,
          present: 0,
        });
        continue;
      }

      // ✅ TOTAL LABS FOR *THIS STUDENT'S SPECIFIC BATCH ONLY*
      const total = await LabAttendanceRecord.countDocuments({
        year: Number(year),
        division: String(division),
        batch: String(studentBatch),  // 🔥 CRITICAL: Must match student's exact batch
        subject: labName,
      });

      console.log(`📈 Total sessions for ${labName} (Batch ${studentBatch}):`, total);

      // ✅ PRESENT COUNT (same filter)
      // 🔥 DEBUG: Check what studentIds are stored in the records
      const sampleRecord = await LabAttendanceRecord.findOne({
        year: Number(year),
        division: String(division),
        batch: String(studentBatch),
        subject: labName,
      });

      if (sampleRecord) {
        console.log(`🔍 Sample studentIds in DB for ${labName}:`, 
          sampleRecord.presentStudents.map(s => s.studentId).slice(0, 3)
        );
        console.log(`🔍 Looking for studentId: "${studentId}" (type: ${typeof studentId})`);
      }

      const present = await LabAttendanceRecord.countDocuments({
        year: Number(year),
        division: String(division),
        batch: String(studentBatch),  // 🔥 CRITICAL: Must match student's exact batch
        subject: labName,
        "presentStudents.studentId": studentId,
      });

      console.log(`✅ Present count for ${labName} (Batch ${studentBatch}):`, present);

      result.push({
        subject: labName,
        total,
        present,
      });
    }

    console.log("✅ Lab summary result:", result);
    res.json({ labs: result });

  } catch (err) {
    console.error("❌ Lab summary failed:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ===============================
   MARK LAB ATTENDANCE (QR)
================================ */
router.post("/mark", async (req, res) => {
  try {
    console.log("📲 LAB QR SCAN →", req.body);

    const { sessionId, studentId, studentYear, studentDivision, studentBatch } =
      req.body;

    if (
      !sessionId ||
      !studentId ||
      !studentYear ||
      !studentDivision ||
      !studentBatch
    ) {
      console.log("❌ Missing data in lab QR scan");
      return res.status(400).json({ msg: "Missing required data" });
    }

    // 1️⃣ Validate session
    const session = await LabAttendanceSession.findOne({ sessionId });

    if (!session) {
      console.log("❌ Invalid lab session:", sessionId);
      return res.status(404).json({ msg: "Invalid or deleted session" });
    }

    // 2️⃣ Expiry check
    if (Date.now() > session.expiresAt) {
      console.log("⏰ Lab session expired:", sessionId);
      return res.status(400).json({ msg: "Session expired" });
    }

    // 3️⃣ 🚨 Year + Division + Batch validation
    if (
      Number(session.year) !== Number(studentYear) ||
      session.division !== studentDivision ||
      session.batch !== studentBatch
    ) {
      console.log("🚫 Student not allowed for this lab", {
        sessionBatch: session.batch,
        studentBatch,
        sessionDivision: session.division,
        studentDivision,
      });

      return res.status(403).json({
        msg: `This session is for ${session.division}-${session.batch} only`,
      });
    }

    // 4️⃣ Duplicate scan check
    const alreadyMarked = await LabAttendanceRecord.findOne({
      sessionId,
      "presentStudents.studentId": studentId,
    });

    if (alreadyMarked) {
      console.log("⚠️ Duplicate lab scan:", studentId);
      return res.status(409).json({ msg: "Attendance already marked" });
    }

    // 5️⃣ Mark present
    console.log(`💾 Storing studentId: "${studentId}" (type: ${typeof studentId})`);
    
    await LabAttendanceRecord.updateOne(
      { sessionId },
      {
        $push: {
          presentStudents: {
            studentId,
            scannedAt: new Date(),
          },
        },
      }
    );

    console.log("✅ Lab attendance marked:", studentId);

    res.json({ msg: "Lab attendance marked successfully" });
  } catch (err) {
    console.error("❌ Lab attendance mark error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


/* ===============================
   GET SESSION DATA
================================ */
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log("📋 Fetching lab attendance for:", sessionId);

    const record = await LabAttendanceRecord.findOne({ sessionId });

    if (!record) {
      console.log("⚠️ No lab attendance record found");
      return res.json({ presentStudents: [] });
    }

    const presentStudents = record.presentStudents.map(
      s => s.studentId
    );

    res.json({ presentStudents });
  } catch (err) {
    console.error("❌ Fetch lab session failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/manual/add", async (req, res) => {
  const { sessionId, studentId } = req.body;

  console.log("➕ Manual add lab attendance:", studentId);

  await LabAttendanceRecord.updateOne(
    { sessionId },
    {
      $addToSet: {
        presentStudents: {
          studentId,
          scannedAt: new Date(),
        },
      },
    },
    { upsert: true }
  );

  res.json({ msg: "Student marked present (lab)" });
});

router.post("/manual/remove", async (req, res) => {
  const { sessionId, studentId } = req.body;

  console.log("➖ Manual remove lab attendance:", studentId);

  await LabAttendanceRecord.updateOne(
    { sessionId },
    {
      $pull: { presentStudents: { studentId } },
    }
  );

  res.json({ msg: "Student marked absent (lab)" });
});


/* ===============================
   DELETE SESSION
================================ */
router.delete("/session/delete", async (req, res) => {
  try {
    const { sessionId } = req.body;

    console.log("🗑️ Deleting lab session:", sessionId);

    await LabAttendanceSession.deleteOne({ sessionId });
    await LabAttendanceRecord.deleteOne({ sessionId });

    console.log("✅ Lab session fully deleted");

    res.json({ msg: "Lab attendance session deleted" });
  } catch (err) {
    console.error("❌ Delete lab session failed:", err);
    res.status(500).json({ msg: "Failed to delete lab session" });
  }
});

/* =====================================================
   🟢 GET RECENT LAB SESSIONS FOR TEACHER (LAST 1 HOUR)
===================================================== */
router.get("/teacher/:teacherId/recent", async (req, res) => {
  try {
    const { teacherId } = req.params;

    console.log("📋 Fetching recent LAB sessions for teacher:", teacherId);

    // ⏱️ last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // 1️⃣ Find lab sessions
    const sessions = await LabAttendanceSession.find({
      teacherId,
      createdAt: { $gte: oneHourAgo },
    }).sort({ createdAt: -1 });

    // 2️⃣ Attach present count
    const sessionsWithCount = await Promise.all(
      sessions.map(async (session) => {
        const record = await LabAttendanceRecord.findOne({
          sessionId: session.sessionId,
        });

        return {
          sessionId: session.sessionId,
          year: session.year,
          division: session.division,
          batch: session.batch,
          subject: session.subject,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          presentCount: record ? record.presentStudents.length : 0,
        };
      })
    );

    console.log(
      `✅ Found ${sessionsWithCount.length} recent lab sessions`
    );

    res.json({ sessions: sessionsWithCount });
  } catch (err) {
    console.error("❌ Fetch recent lab sessions failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;