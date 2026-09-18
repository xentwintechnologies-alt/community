const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const c = require("../controllers/userController");

router.get("/students", auth, requireRole("staff"), c.listStudents);
router.get("/students/:id", auth, requireRole("staff"), c.getStudent);
router.put("/profile", auth, requireRole("student"), c.updateProfile);

module.exports = router;
