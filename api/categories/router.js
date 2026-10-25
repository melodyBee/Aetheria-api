const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../../middleware/auth");
const {
  getAllCategories,
  getCategoryByID,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./contoller");

// public
router.get("/get-all-categories", getAllCategories);
router.get("/get-category-by-id", getCategoryByID);

// admin only
router.post("/create-category", auth, adminOnly, createCategory);
router.put("/update-category", auth, adminOnly, updateCategory);
router.delete("/delete-category", auth, adminOnly, deleteCategory);

module.exports = router;
