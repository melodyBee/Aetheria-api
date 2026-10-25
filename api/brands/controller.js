const Brand = require("./schema");
const { isValidObjectId } = require("mongoose");

const serverError = (res, error) =>
  res.status(500).json({ message: "Server Error", error: error.message });

const addBrands = async (req, res) => {
  const { BrandName, BrandImage, BrandDescription } = req.body;

  if (!BrandName || !BrandImage) {
    return res.status(400).json({ message: "Missing Required Fields" });
  }

  try {
    if (await Brand.exists({ BrandName })) {
      return res.status(400).json({ message: "Brand Already Exists" });
    }
    const brand = await Brand.create({ BrandName, BrandImage, BrandDescription });
    res.status(201).json({ message: "Brand Created", Brands: brand });
  } catch (error) {
    serverError(res, error);
  }
};

const getAllBrands = async (req, res) => {
  try {
    const allBrands = await Brand.find();
    res.json({ Brands: allBrands });
  } catch (error) {
    serverError(res, error);
  }
};

const getBrandsByID = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid brand id" });
  }

  try {
    const brand = await Brand.findById(id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json({ Brands: brand });
  } catch (error) {
    serverError(res, error);
  }
};

const updateBrands = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid brand id" });
  }

  const { BrandName, BrandImage, BrandDescription } = req.body;
  const update = {};
  if (BrandName) update.BrandName = BrandName;
  if (BrandImage) update.BrandImage = BrandImage;
  if (BrandDescription !== undefined) update.BrandDescription = BrandDescription;
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const brand = await Brand.findByIdAndUpdate(id, update, { new: true });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json({ message: "Brand Updated", Brands: brand });
  } catch (error) {
    serverError(res, error);
  }
};

const deleteBrands = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid brand id" });
  }

  try {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json({ message: "Brand Deleted Successfully", Brands: brand });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  getAllBrands,
  getBrandsByID,
  updateBrands,
  deleteBrands,
  addBrands,
};
