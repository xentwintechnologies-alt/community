const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, default: "Xentwin Technology", immutable: true },
    orgLabel: { type: String, default: "Offered by Xentwin Technology", immutable: true },
    description: { type: String, required: true },
    responsibilities: [String],
    requiredSkills: [String],
    eligibility: String,
    duration: String,
    mode: { type: String, enum: ["Remote", "On-site", "Hybrid"] },
    location: String,
    openings: { type: Number, default: 1 },  // <-- NEW: how many students needed
    deadline: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", internshipSchema);