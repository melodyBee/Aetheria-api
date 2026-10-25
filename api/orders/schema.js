const { Schema, model } = require("mongoose");

const Orders = model("Orders", orderSchema);
module.exports = Orders;
