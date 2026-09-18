const Internship = require("../models/Internship");
const Application = require("../models/Application");

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const filter = search ? { title: { $regex: search, $options: "i" } } : {};
    const internships = await Internship.find(filter).sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json(internship);
  } catch (err) {
    next(err);
  }
}

// staff only
async function create(req, res, next) {
  try {
    const internship = await Internship.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(internship);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { organization, orgLabel, ...allowed } = req.body; // org fields are immutable, ignore if sent
    const internship = await Internship.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
      runValidators: true,
    });
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json(internship);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json({ message: "Internship deleted" });
  } catch (err) {
    next(err);
  }
}

// student only - apply with duplicate prevention (DB unique index also guards this)
async function apply(req, res, next) {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });

    const existing = await Application.findOne({ student: req.user._id, internship: internship._id });
    if (existing) return res.status(409).json({ message: "You already applied to this internship" });

    const application = await Application.create({
      student: req.user._id,
      internship: internship._id,
      resumeUrl: req.user.resumeUrl,
      resumeName: req.user.resumeName,
    });
    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "You already applied to this internship" });
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, apply };
