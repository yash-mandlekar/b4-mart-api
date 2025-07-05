const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const orderModel =require("../models/orderModel");
const { sendtoken } = require("../utils/sendToken");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const mongoose = require('mongoose');

exports.create_shop = async (req, res) => {
  try {
    const user = await userModel.findOne({ contact: req.body.contact });
    if (user) {
      return res.status(200).json({ message: "User already exists" });
    }
    const newuser = await userModel.create(req.body);
    newuser.role = "shop";
    await newuser.save();

    res
      .status(201)
      .json({ message: "Shop created successfully", user: newuser });
  } catch (err) {
    res.status(401).json({ messege: err });
  }
};

exports.all_shop = catchAsyncErrors(async (req, res) => {
  const shops = await userModel.find({ role: "shop" });
  res.json({ message: "All Shops", shops });
});
exports.singleshop_products = async (req, res) => {
  try {
    const user = await userModel
      .findById({ _id: req.params.id })
      .populate("products");
    res.json({ message: "All Products by shop", products: user.products });
  } catch (err) {
    console.log(err);
  }
};
exports.delete_shop = async (req, res) => {
  try {
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.status(201).json({ message: "Shop deleted successfully" });
  } catch (err) {
    res.status(401).json({ messege: err });
  }
};

exports.login = async (req, res) => {
  try {
    const { contact, password } = req.body;

    const user = await userModel
      .findOne({ contact: contact })
      .select("+password");

    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.role == "shop" || user.role == "admin") {
      const isMatch = user.comparepassword(password);

      if (!isMatch)
        return res.status(401).json({
          success: false,
          message: "Enter Correct Number and Password",
        });

      sendtoken({ message: "Logged in successfully" }, user, 200, res);
    } else {
      res.json({ message: "You didn't have access the resources" });
    }
  } catch (err) {
    res.json({ message: err });
  }
};

exports.upgrade_role = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { contact: req.body.contact },
      { role: req.body.role }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

// Users

exports.all_user = async (req, res) => {

  const user = await userModel.find({ role: "user" });
  res.json(user);
};

exports.delete_user = async (req, res) => {
  const user = await userModel.findOneAndDelete({ _id: req.params.id });
  res.json({ message: "User deleted successfully", user: user.contact });
};

// Products

exports.add_product = async (req, res) => {
  try {
    const product = await productModel.create(req.body);
    product.shop_id = req.id;
    await product.save();
    const shop = await userModel.findOne({ _id: req.id });
    shop.products.push(product._id);
    await shop.save();
    res.status(201).json({ message: "Created Product", product: product });
  } catch (err) {
    res.status(400).json({ message: err.message }); // Use 400 for validation errs
  }
};

exports.all_product = async (req, res) => {
  try {
    const products = await productModel.find().populate("shop_id"); // Use plural 'products'
    res.status(200).json({
      message: "All Products",
      count: products.length,
      products: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update_product = async (req, res) => {
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ); // Use findByIdAndUpdate for updates
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete_product = async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.delete_allproduct = async (req, res) => {
  try {
    await productModel.deleteMany();
    res.status(200).json({ message: "All Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Orders
exports.all_orders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.status(201).json({ message: "Created Product", product: product });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
exports.all_dateorders = async (req, res) => {
  try {
    const orders = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $ne: null } // Ensure createdAt is not null
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }, // Count the number of orders
          firstOrderDate: { $min: '$createdAt' } // Get the earliest order date in the group
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort by year and month
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          count: 1,
          firstOrderDate: 1 // Include the earliest order date
        }
      }
    ]);
    
    
    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err });
  }
};
exports.update_orders = async (req, res) => {
  try {
    const orders = await orderModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!orders) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(201).json({ message: "Updated order", order: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.shop_orders = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.id }).populate({
      path: "shoporders",
      populate: {
        path: "customer product",
      },
    });

    res.status(201).json({ data: user.shoporders });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.delete_all = async (req, res) => {
  try {
    await userModel.deleteMany();
    await orderModel.deleteMany();
    await productModel.deleteMany();
    const user = await userModel.find();
    const product = await productModel.find();
    const order = await orderModel.find();
    res.status(201).json({ user, product, order });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
