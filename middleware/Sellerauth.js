const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");
require("dotenv").config();

const SellerAuth = async (req, res, next) => {
  try {
    const header = req.header("Authorization");
    if (!header) {
      throw new Error();
    }

    const Authtoken = header.replace("Bearer", "").trim();

    // Fixed: Use the secret from .env that matches your Seller model
    const decoded = jwt.verify(Authtoken, process.env.seller_password);

    // Fixed: Use findOne instead of find for cleaner data handling
    const seller = await Seller.findOne({
      _id: decoded._id,
      "tokens.token": Authtoken,
    });

    if (!seller) {
      throw new Error();
    }

    // Attach to request
    req.seller = seller;
    req.token = Authtoken;

    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate as a seller." });
  }
};

module.exports = SellerAuth;
