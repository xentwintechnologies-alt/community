const Hackathon = require("../models/Hackathon");
const HackathonRegistration = require("../models/HackathonRegistration");
const { createNotification } = require("../services/notificationService");

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};
    res.json(await Hackathon.find(filter).sort({ date: 1 }));
  } catch (err) { next(err); }
}
async function getOne(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    res.json(hackathon);
  } catch (err) { next(err); }
}
async function create(req, res, next) {
  try { res.status(201).json(await Hackathon.create({ ...req.body, createdBy: req.user._id })); } catch (err) { next(err); }
}
async function update(req, res, next) {
  try {
    const { organization, orgLabel, ...allowed } = req.body;
    const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    res.json(hackathon);
  } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    res.json({ message: "Hackathon deleted" });
  } catch (err) { next(err); }
}
async function register(req, res, next) {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const {
      teamName, leaderName, leaderEmail, phone, teamMembers, college,
      projectTitle, projectDescription, githubLink, agreedToRules,
    } = req.body;

    const required = { teamName, leaderName, leaderEmail, phone, teamMembers, college };
    for (const [key, value] of Object.entries(required)) {
      if (!value?.toString().trim()) {
        return res.status(400).json({ message: `${key} is required` });
      }
    }
    if (!agreedToRules) {
      return res.status(400).json({ message: "You must agree to the hackathon rules" });
    }

    const reg = await HackathonRegistration.create({
      student: req.user._id,
      hackathon: hackathon._id,
      teamName: teamName.trim(),
      leaderName: leaderName.trim(),
      leaderEmail: leaderEmail.trim(),
      phone: phone.trim(),
      teamMembers: teamMembers.trim(),
      college: college.trim(),
      projectTitle: projectTitle?.trim() || "",
      projectDescription: projectDescription?.trim() || "",
      githubLink: githubLink?.trim() || "",
      agreedToRules: true,
    });

    await createNotification(
      req.user._id,
      "hackathon_registration",
      "Your hackathon registration is confirmed.",
      req.app.get("io")
    );

    res.status(201).json(reg);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already registered for this hackathon" });
    next(err);
  }
}

// student: my hackathon registrations
async function myRegistrations(req, res, next) {
  try {
    const registrations = await HackathonRegistration.find({ student: req.user._id })
      .populate("hackathon", "name organization orgLabel date registrationDeadline teamSize");
    res.json(registrations);
  } catch (err) { next(err); }
}

// staff: view registrants for a hackathon
async function registrationsFor(req, res, next) {
  try {
    const registrations = await HackathonRegistration.find({ hackathon: req.params.id })
      .populate("student", "name email university course");
    res.json(registrations);
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove, register, myRegistrations, registrationsFor };