const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../../middleware/auth");
const {
  getAllProducts,
  getProductsByID,
  updateProducts,
  deleteProducts,
  addProducts,
} = require("./controller");

// public
router.get("/products", getAllProducts);
router.get("/product/:id", getProductsByID);

// admin only
router.post("/addProducts", auth, adminOnly, addProducts);
router.delete("/delete-product/:id", auth, adminOnly, deleteProducts);
router.put("/update-product/:id", auth, adminOnly, updateProducts);

module.exports = router;
