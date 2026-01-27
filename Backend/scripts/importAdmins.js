const fs = require("fs");
const mongoose = require("mongoose");
const Admin = require("../Modals/Admin");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (admins)");

    const raw = fs.readFileSync("./Admindata.json", "utf-8");
    const admins = JSON.parse(raw);

    let inserted = 0;
    let skipped = 0;

    for (const a of admins) {
      if (!a.id || !a.password) {
        console.log("⚠️ Skipping invalid admin:", a);
        skipped++;
        continue;
      }

      try {
        await Admin.create({
          id: a.id,
          email: a.email,
          password: a.password, // (plain for now)
          branch: a.branch,
          role: "admin"
        });
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️ Duplicate admin skipped: ${a.id}`);
          skipped++;
        } else {
          console.error("❌ Admin insert error:", err.message);
        }
      }
    }

    console.log("🎉 Admin import completed");
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`⚠️ Skipped: ${skipped}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Admin import failed:", err.message);
    process.exit(1);
  }
}

importAdmins();
