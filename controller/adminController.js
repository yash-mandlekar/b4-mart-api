const ProductData = require("../models/productModel");

exports.admin_dashboard = async (req, res) => {
  try {
    res.status(201).json({ message: "Welcome Admin" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
