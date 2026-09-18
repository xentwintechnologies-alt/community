const Application = require("../models/Application");
const { createNotification } = require("../services/notificationService");

// student: my applications
async function myApplications(req, res, next) {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("internship", "title organization orgLabel deadline");
    res.json(applications);
  } catch (err) {
    next(err);
  }
}

// staff: view applications, optionally filter by internship
async function list(req, res, next) {
  try {
    const filter = req.query.internship ? { internship: req.query.internship } : {};
    const applications = await Application.find(filter)
      .populate("student", "name email university course resumeUrl resumeName")
      .populate("internship", "title");
    res.json(applications);
  } catch (err) {
    next(err);
  }
}

// staff: update status -> triggers notification
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ["Applied", "Under Review", "Shortlisted", "Selected", "Rejected"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("internship", "title");
    if (!application) return res.status(404).json({ message: "Application not found" });

    await createNotification(
      application.student,
      "application_status_changed",
      `Your application for ${application.internship.title} is now ${status}.`,
      req.app.get("io")
    );

    res.json(application);
  } catch (err) {
    next(err);
  }
}

module.exports = { myApplications, list, updateStatus };
