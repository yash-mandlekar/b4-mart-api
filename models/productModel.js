const mongoose = require("mongoose");

const productSubSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Paan Corner",
        "Dairy, Bread & Eggs",
        "Fruits & Vegetables",
        "Cold Drinks & Juices",
        "Snacks & Munchies",
        "Breakfast & Instant Food",
        "Sweet Tooth",
        "Bakery",
        "Tea, Coffee & Health Drink",
        "Atta, Rice & Dal",
        "Masala, Oil & More",
        "Sauces & Spreads",
        "Chicken, Meat & Fish",
        "Organic & Healthy Living",
        "Baby Care",
        "Pharma & Wellness",
        "Cleaning Essentials",
        "Home & Office",
        "Personal Care",
        "Pet Care",
      ],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    quantity_type: {
      type: String,
      required: true,
      enum: ["g", "kg", "l", "ml", "peice"],
    },
    productpic: [
      {
        type: String,
      },
    ],
    stocks: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSubSchema);
