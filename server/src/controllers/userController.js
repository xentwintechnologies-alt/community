const User = require("../models/User");
const Application = require("../models/Application");

// staff: list/search students
async function listStudents(req, res, next) {
  try {
    const { search } = req.query;
    const filter = { role: "student", ...(search ? { name: { $regex: search, $options: "i" } } : {}) };
    const students = await User.find(filter).select("-passwordHash");
    res.json(students);
  } catch (err) { next(err); }
}

async function getStudent(req, res, next) {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" }).select("-passwordHash");
    if (!student) return res.status(404).json({ message: "Student not found" });
    const applications = await Application.find({ student: student._id }).populate("internship", "title");
    res.json({ student, applications });
  } catch (err) { next(err); }
}

// student: update own profile
async function updateProfile(req, res, next) {
  try {
    const { name, phone, university, course, year, skills } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, university, course, year, skills },
      { new: true, runValidators: true }
    ).select("-passwordHash");
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { listStudents, getStudent, updateProfile };
