const mongoose = require("mongoose");

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },

    // Team details
    teamName: { type: String, required: true },
    leaderName: { type: String, required: true },
    leaderEmail: { type: String, required: true },
    phone: { type: String, required: true },
    teamMembers: { type: String, required: true },
    college: { type: String, required: true },

    // Project details
    projectTitle: String,
    projectDescription: String,
    githubLink: String,

    agreedToRules: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

hackathonRegistrationSchema.index({ student: 1, hackathon: 1 }, { unique: true });

module.exports = mongoose.model("HackathonRegistration", hackathonRegistrationSchema);