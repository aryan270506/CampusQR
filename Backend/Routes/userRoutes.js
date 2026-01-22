const express = require("express");
const router = express.Router();
const User = require("../Modals/User");

// LOGIN (or re-login)
router.post("/login", async (req, res) => {
  console.log("✅ LOGIN API HIT", req.body);

  const { userId, role, socketId } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { userId },
      {
        userId,
        role,
        socketId,
        loginTime: new Date(),
        logoutTime: null,
        status: "active",
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, user });
  } catch (err) {
    console.error("❌ LOGIN SAVE ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  const { userId } = req.body;

  try {
    await User.findOneAndUpdate(
      { userId },
      {
        status: "deactivated",
        logoutTime: new Date(),
        socketId: null,
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ LOGOUT ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
