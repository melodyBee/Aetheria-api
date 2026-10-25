const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../../middleware/auth");

const {
  Login,
  Signup,
  updateProfile,
  userByID,
  getAllUsers,
  deleteUser,
  me,
} = require("./controller");

router.post("/login", Login);
router.post("/signup", Signup);
router.get("/me", auth, me);
router.get("/getalluser", auth, adminOnly, getAllUsers);
router.get("/getuserby/:id", auth, userByID);
router.delete("/delete-user", auth, adminOnly, deleteUser);
router.put("/update-profile", auth, updateProfile);

module.exports = router;
