const { Schema, model } = require("mongoose");

const BrandSchema = new Schema({
  BrandName: { type: String, required: true, unique: true },
  BrandImage: { type: String, required: true },
  BrandDescription: { type: String, default: "" },
});

const Brand = model("brand", BrandSchema);
module.exports = Brand;
