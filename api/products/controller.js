const Products = require("./schema");
const { isValidObjectId } = require("mongoose");

const FIELDS = [
  "ProductsName",
  "ProductsImage",
  "ProductsDescription",
  "ProductsPrice",
  "ProductsRatings",
  "ProductsBrand",
  "ProductsCategories",
];

const serverError = (res, error) =>
  res.status(500).json({ message: "Server Error", error: error.message });

// copies only the fields that were actually sent
const pickFields = (body) => {
  const data = {};
  FIELDS.forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  return data;
};

const addProducts = async (req, res) => {
  const data = pickFields(req.body);
  const { ProductsName, ProductsImage, ProductsDescription, ProductsPrice } =
    data;

  if (
    !ProductsName ||
    !ProductsImage ||
    !ProductsDescription ||
    ProductsPrice === undefined ||
    ProductsPrice === ""
  ) {
    return res.status(400).json({ message: "Missing Required Fields" });
  }
  if (isNaN(Number(ProductsPrice))) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  try {
    if (await Products.exists({ ProductsName })) {
      return res.status(400).json({ message: "Product Already Exists" });
    }
    const product = await Products.create(data);
    res.status(201).json({ message: "Product Created", product });
  } catch (error) {
    serverError(res, error);
  }
};

// optional filters: /products?category=Shoes&brand=Nike
const getAllProducts = async (req, res) => {
  const filter = {};
  if (req.query.category) filter.ProductsCategories = req.query.category;
  if (req.query.brand) filter.ProductsBrand = req.query.brand;

  try {
    const allProducts = await Products.find(filter);
    res.json({ Products: allProducts });
  } catch (error) {
    serverError(res, error);
  }
};

const getProductsByID = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const product = await Products.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    serverError(res, error);
  }
};

const updateProducts = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const data = pickFields(req.body);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }
  if (data.ProductsPrice !== undefined && isNaN(Number(data.ProductsPrice))) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  try {
    const product = await Products.findByIdAndUpdate(id, data, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product Updated", product });
  } catch (error) {
    serverError(res, error);
  }
};

const deleteProducts = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const product = await Products.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product Deleted Successfully", product });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  getAllProducts,
  getProductsByID,
  updateProducts,
  deleteProducts,
  addProducts,
};
