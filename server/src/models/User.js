const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "staff"], required: true },

    // student-only profile fields
    phone: String,
    university: String,
    course: String,
    year: String,
    skills: [String],
    resumeUrl: String,
    resumeName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
