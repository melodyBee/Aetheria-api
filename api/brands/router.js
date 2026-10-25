const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../../middleware/auth");
const {
  getAllBrands,
  getBrandsByID,
  updateBrands,
  deleteBrands,
  addBrands,
} = require("./controller");

// public
router.get("/Brands", getAllBrands);
router.get("/brand/:id", getBrandsByID);

// admin only
router.post("/addBrands", auth, adminOnly, addBrands);
router.delete("/delete-brands/:id", auth, adminOnly, deleteBrands);
router.put("/update-brand/:id", auth, adminOnly, updateBrands);

module.exports = router;
