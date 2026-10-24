const Category = require("./schema");
const { isValidObjectId } = require("mongoose");

const serverError = (res, error) =>
  res.status(500).json({ message: "Server Error", error: error.message });

const getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find();
    res.json({ category: allCategories });
  } catch (error) {
    serverError(res, error);
  }
};

const getCategoryByID = async (req, res) => {
  const { _id } = req.query;
  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid category id" });
  }

  try {
    const category = await Category.findById(_id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (error) {
    serverError(res, error);
  }
};

const createCategory = async (req, res) => {
  const { CategoryName, CategoryImage } = req.body;

  if (!CategoryName || !CategoryImage) {
    return res.status(400).json({ message: "Missing Required Field" });
  }

  try {
    if (await Category.exists({ CategoryName })) {
      return res.status(400).json({ message: "Category Already Exists" });
    }
    await Category.create({ CategoryName, CategoryImage });
    const category = await Category.find();
    res.status(201).json({ message: "Category Created", category });
  } catch (error) {
    serverError(res, error);
  }
};

const updateCategory = async (req, res) => {
  const { _id, CategoryName, CategoryImage } = req.body;
  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid category id" });
  }

  const update = {};
  if (CategoryName) update.CategoryName = CategoryName;
  if (CategoryImage) update.CategoryImage = CategoryImage;
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const updated = await Category.findByIdAndUpdate(_id, update, { new: true });
    if (!updated) return res.status(404).json({ message: "Category not found" });
    const category = await Category.find();
    res.json({ message: "Success", category });
  } catch (error) {
    serverError(res, error);
  }
};

const deleteCategory = async (req, res) => {
  const { _id } = req.body;
  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid category id" });
  }

  try {
    const result = await Category.deleteOne({ _id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    const category = await Category.find();
    res.json({ message: "Deleted Successfully", category });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryByID,
  createCategory,
  updateCategory,
  deleteCategory,
};
