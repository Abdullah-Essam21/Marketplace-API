const mongoose = require("mongoose");

// Fixed: Added 'const' and included 'ref' for better data retrieval
const TransactionSchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "seller", // Points to the Seller model
    },
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "buyer", // Points to the Buyer model
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product", // Points to the Product model
    },
  },
  {
    timestamps: true,
  },
);

// Fixed: Added 'const' to prevent global scope issues
const Transaction = mongoose.model("transaction", TransactionSchema);

module.exports = Transaction;
