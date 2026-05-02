const mongoose = require("mongoose");

// Fixed: Use 'const' to prevent global scope issues
const ProductSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Safety: Prevents accidental negative prices
    },
    clicks: {
      type: Number,
      required: true,
      default: 0, // Added: So you don't have to manually set it to 0 every time
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "seller", // Matches the model name in your Seller file
    },
  },
  {
    timestamps: true,
  },
);

// Fixed: Use 'const'
const Product = mongoose.model("product", ProductSchema);

module.exports = Product;
