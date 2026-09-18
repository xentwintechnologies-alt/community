const Workshop = require("../models/Workshop");
const WorkshopRegistration = require("../models/WorkshopRegistration");
const { createNotification } = require("../services/notificationService");

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const filter = search ? { title: { $regex: search, $options: "i" } } : {};
    res.json(await Workshop.find(filter).sort({ date: 1 }));
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });
    res.json(workshop);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    res.status(201).json(await Workshop.create({ ...req.body, createdBy: req.user._id }));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { organization, orgLabel, ...allowed } = req.body;
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });
    res.json(workshop);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });
    res.json({ message: "Workshop deleted" });
  } catch (err) { next(err); }
}

async function register(req, res, next) {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found" });
    const reg = await WorkshopRegistration.create({ student: req.user._id, workshop: workshop._id });

    await createNotification(
      req.user._id,
      "workshop_registration",
      `Your registration for ${workshop.title} is confirmed.`,
      req.app.get("io")
    );

    res.status(201).json(reg);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already registered for this workshop" });
    next(err);
  }
}

// student: my workshop registrations
async function myRegistrations(req, res, next) {
  try {
    const registrations = await WorkshopRegistration.find({ student: req.user._id })
      .populate("workshop", "title organization orgLabel date time mode registrationDeadline");
    res.json(registrations);
  } catch (err) { next(err); }
}

// staff: view registrants for a workshop
async function registrationsFor(req, res, next) {
  try {
    const registrations = await WorkshopRegistration.find({ workshop: req.params.id })
      .populate("student", "name email university course");
    res.json(registrations);
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove, register, myRegistrations, registrationsFor };
