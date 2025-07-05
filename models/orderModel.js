const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }, // User who placed the order
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    count: {
      type: Number,
    },
    // List of products in the order
    totalAmount: { type: Number, required: true }, // Total price of the order
    city: { type: String, required: true },
    area: { type: String, required: true },
    house_no: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "not available",
      ],
      default: "placed",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("order", OrderSchema);
