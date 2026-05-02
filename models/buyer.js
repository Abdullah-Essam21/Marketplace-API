const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. Always use 'const' to define your Schema to avoid global scope pollution
const BuyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Recommended: saves emails as lowercase to prevent login issues
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Not an Email");
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7, // Safety tip: Add a minimum length
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// 2. Hash password before saving
BuyerSchema.pre("save", async function () {
  const buyer = this;
  if (buyer.isModified("password")) {
    buyer.password = await bcrypt.hash(buyer.password, 8);
  }
});

// 3. Automatically hide private data
BuyerSchema.methods.toJSON = function () {
  const buyer = this;
  const buyerObject = buyer.toObject();

  delete buyerObject.password;
  delete buyerObject.tokens;

  return buyerObject;
};

// 4. Generate JWT
BuyerSchema.methods.getAuthToken = async function () {
  const buyer = this;
  // Use a clear secret name from .env (usually named JWT_SECRET)
  const token = jwt.sign(
    { _id: buyer._id.toString() },
    process.env.buyer_password,
  );

  buyer.tokens = buyer.tokens.concat({ token });
  await buyer.save();

  return token;
};

// 5. Login helper (Statics)
BuyerSchema.statics.FindByCredentials = async function (email, password) {
  // Fixed: Added 'const' to prevent making 'buyer' a global variable
  const buyer = await this.findOne({ email });

  if (!buyer) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, buyer.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return buyer;
};

// 6. Create the model
const Buyer = mongoose.model("Buyer", BuyerSchema);

module.exports = Buyer;
