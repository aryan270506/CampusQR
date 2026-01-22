const express = require("express");
const AttendanceSession = require("../Modals/AttendanceSession");
const AttendanceRecord = require("../Modals/AttendanceRecord");

const router = express.Router();

/* =====================================================
   🟢 TEST ROUTE
===================================================== */
router.get("/test", (req, res) => {
  res.json({ msg: "Attendance routes working ✅" });
});

/* =====================================================
   🟢 CREATE ATTENDANCE SESSION (TEACHER)
===================================================== */
router.post("/session/create", async (req, res) => {
  try {
    const { teacherId, year, division, subject } = req.body;

    if (!teacherId || !year || !division || !subject) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const sessionId = `S_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const session = await AttendanceSession.create({
      sessionId,
      teacherId,
      year,
      division,
      subject,
      expiresAt,
    });

    console.log("📘 Session created:", sessionId);

    res.json({
      sessionId,
      expiresAt,
    });
  } catch (err) {
    console.error("❌ Session creation failed:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🟢 MARK STUDENT PRESENT (QR SCAN)
===================================================== */
router.post("/mark", async (req, res) => {
  try {
    const { sessionId, studentId, studentYear, studentDivision } = req.body;

    if (!sessionId || !studentId || !studentYear || !studentDivision) {
      return res.status(400).json({ msg: "Missing required data" });
    }

    // 1️⃣ Validate session
    const session = await AttendanceSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ msg: "Invalid or deleted session" });
    }

    // 2️⃣ Check expiry
    if (Date.now() > session.expiresAt) {
      return res.status(400).json({ msg: "Session expired" });
    }

    // 3️⃣ 🚨 CLASS & DIVISION VALIDATION (CRITICAL)
    if (
      Number(session.year) !== Number(studentYear) ||
      String(session.division) !== String(studentDivision)
    ) {
      return res.status(403).json({
        msg: "You are not allowed to mark attendance for this class",
      });
    }

    // 4️⃣ Duplicate scan check
    const alreadyMarked = await AttendanceRecord.findOne({
      sessionId,
      "presentStudents.studentId": studentId,
    });

    if (alreadyMarked) {
      return res.status(409).json({
        msg: "Attendance already marked",
      });
    }

    // 5️⃣ Mark present (ONCE)
    await AttendanceRecord.updateOne(
      { sessionId },
      {
        $push: {
          presentStudents: {
            studentId,
            scannedAt: new Date(),
          },
        },
      },
      { upsert: true }
    );

    console.log(`✅ Attendance marked → ${studentId}`);

    res.json({ msg: "Attendance marked successfully" });
  } catch (err) {
    console.error("❌ Attendance mark error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});




/* =====================================================
   🟢 GET PRESENT COUNT (LIVE / RECENT CLASSES)
===================================================== */
router.get("/session/:sessionId/present", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const record = await AttendanceRecord.findOne({ sessionId });

    const presentCount = record ? record.presentStudents.length : 0;

    res.json({
      sessionId,
      presentCount,
      students: record?.presentStudents || [],
    });
  } catch (err) {
    console.error("❌ Fetch present count failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get present students for a session
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const record = await AttendanceRecord.findOne({ sessionId });

    if (!record) {
      return res.json({ presentStudents: [] });
    }

    const presentStudents = record.presentStudents.map(
      s => s.studentId
    );

    res.json({ presentStudents });
  } catch (err) {
    console.error("❌ Fetch session attendance failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


/* =====================================================
   🟢 GET RECENT SESSIONS FOR TEACHER (LAST 1 HOUR)
===================================================== */
router.get("/teacher/:teacherId/recent", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Calculate 1 hour ago timestamp
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find all sessions created in the last hour for this teacher
    const sessions = await AttendanceSession.find({
      teacherId,
      createdAt: { $gte: oneHourAgo },
    }).sort({ createdAt: -1 }); // newest first

    // For each session, get the present count
    const sessionsWithCount = await Promise.all(
      sessions.map(async (session) => {
        const record = await AttendanceRecord.findOne({
          sessionId: session.sessionId,
        });

        return {
          sessionId: session.sessionId,
          year: session.year,
          division: session.division,
          subject: session.subject,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          presentCount: record ? record.presentStudents.length : 0,
        };
      })
    );

    console.log(`📋 Found ${sessionsWithCount.length} recent sessions for teacher ${teacherId}`);

    res.json({
      sessions: sessionsWithCount,
    });
  } catch (err) {
    console.error("❌ Fetch recent sessions failed:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const record = await AttendanceRecord.findOne({ sessionId });

    if (!record) {
      return res.json({ presentStudents: [] });
    }

    const presentStudents = record.presentStudents.map(
      s => s.studentId
    );

    res.json({ presentStudents });
  } catch (err) {
    console.error("❌ Fetch session attendance failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.post("/manual/add", async (req, res) => {
  const { sessionId, studentId } = req.body;

  await AttendanceRecord.updateOne(
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

  res.json({ msg: "Student marked present" });
});
router.post("/manual/remove", async (req, res) => {
  const { sessionId, studentId } = req.body;

  await AttendanceRecord.updateOne(
    { sessionId },
    {
      $pull: {
        presentStudents: { studentId },
      },
    }
  );

  res.json({ msg: "Student marked absent" });
});
router.post("/manual/mark-all-present", async (req, res) => {
  try {
    const { sessionId, studentIds } = req.body;

    if (!sessionId || !studentIds?.length) {
      return res.status(400).json({ msg: "Invalid data" });
    }

    const presentStudents = studentIds.map(id => ({
      studentId: id,
      scannedAt: new Date(),
    }));

    await AttendanceRecord.updateOne(
      { sessionId },
      { $set: { presentStudents } },
      { upsert: true }
    );

    console.log(`✅ Marked ALL present → ${studentIds.length}`);

    res.json({ msg: "All students marked present" });
  } catch (err) {
    console.error("❌ Mark all present failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/session/delete", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ msg: "Session ID required" });
    }

    // ❌ DELETE SESSION
    await AttendanceSession.deleteOne({ sessionId });

    // ❌ DELETE ATTENDANCE RECORD
    await AttendanceRecord.deleteOne({ sessionId });

    console.log(`🗑️ Attendance session fully deleted → ${sessionId}`);

    res.json({ msg: "Attendance session deleted completely" });
  } catch (err) {
    console.error("❌ Delete session failed:", err);
    res.status(500).json({ msg: "Failed to delete session" });
  }
});

router.post("/student-summary", async (req, res) => {
  try {
    const { studentId, year, division, subjects } = req.body;

    if (!studentId || !year || !division || !subjects?.length) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const result = [];

    for (const subject of subjects) {
      // 1️⃣ TOTAL LECTURES (sessions created)
      const totalLectures = await AttendanceSession.countDocuments({
        year,
        division,
        subject,
      });

      // 2️⃣ ATTENDED LECTURES (student present)
      const attendedLectures = await AttendanceRecord.countDocuments({
        "presentStudents.studentId": studentId,
        sessionId: {
          $in: await AttendanceSession.find(
            { year, division, subject },
            { sessionId: 1, _id: 0 }
          ).then(s => s.map(x => x.sessionId)),
        },
      });

      result.push({
        subject,
        present: attendedLectures,
        total: totalLectures,
      });
    }

    res.json({ subjects: result });
  } catch (err) {
    console.error("❌ Student summary error:", err);
    res.status(500).json({ msg: "Failed to calculate attendance" });
  }
});



router.post("/manual/mark-all-absent", async (req, res) => {
  const { sessionId } = req.body;

  await AttendanceRecord.updateOne(
    { sessionId },
    { $set: { presentStudents: [] } }
  );

  res.json({ msg: "All students marked absent" });
});


/* =====================================================
   🟢 DELETE SESSION (TEACHER DELETES CLASS)
===================================================== */
router.delete("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    await AttendanceSession.deleteOne({ sessionId });
    await AttendanceRecord.deleteOne({ sessionId });

    console.log("🗑️ Session deleted:", sessionId);

    res.json({ msg: "Session deleted successfully" });
  } catch (err) {
    console.error("❌ Session delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;