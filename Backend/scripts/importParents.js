const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Parent = require("../Modals/Parent");

const MONGO_URI = "mongodb://localhost:27017/Attendence-System";

async function importParents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (parents)");

    const raw = fs.readFileSync("./parentsdata.json", "utf-8");
    const parents = JSON.parse(raw);

    const parentsDocs = await Promise.all(
  parents.map(async (p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    passwordHash: await bcrypt.hash(p.password, 10),

    prn: p.prn,
    roll_no: p.roll_no,
    year: Number(p.year),
    division: p.division,
    branch: p.branch,
    subjects: p.subjects || [],
    lab: p.lab || [],

    role: "parent",
  }))
);



    await Parent.insertMany(docs, { ordered: false });

    console.log(`🎉 Imported ${docs.length} parents`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Parent import failed:", err.message);
    process.exit(1);
  }
}

importParents();