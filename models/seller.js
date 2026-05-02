const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("not a valid email");
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7, // Added for basic security
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

// Virtual for connecting products to the seller
SellerSchema.virtual("products", {
  // Renamed to 'products' (plural) for better logic
  ref: "product",
  localField: "_id",
  foreignField: "owner",
});

// LOGIN LOGIC
SellerSchema.statics.findByCredentials = async function (email, password) {
  // Fixed: Using 'this' instead of the 'Seller' variable prevents reference errors
  const seller = await this.findOne({ email });
  if (!seller) throw new Error("unable to log in");

  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) throw new Error("unable to log in");

  return seller;
};

// DATA SANITIZATION
SellerSchema.methods.toJSON = function () {
  const seller = this;
  const sellerobj = seller.toObject();

  delete sellerobj.password;
  delete sellerobj.tokens;

  return sellerobj;
};

// AUTH TOKEN GENERATION
SellerSchema.methods.getAuthtoken = async function () {
  const seller = this;
  const token = jwt.sign(
    { _id: seller._id.toString() },
    process.env.seller_password,
  );

  seller.tokens = seller.tokens.concat({ token });
  await seller.save();

  return token;
};

// PASSWORD HASHING (Fixed: Changed Sync to Async)
SellerSchema.pre("save", async function () {
  const seller = this;
  if (seller.isModified("password")) {
    seller.password = await bcrypt.hash(seller.password, 8);
  }
});

// Fixed: Added 'const' to prevent global scope issues
const Seller = mongoose.model("seller", SellerSchema);

module.exports = Seller;
