const jwt = require("jsonwebtoken");
const Buyer = require("../models/buyer");
require("dotenv").config(); // Load environment variables

const BuyerAuth = async (req, res, next) => {
  try {
    // 1. Get the token from the header
    const header = req.header("Authorization");
    if (!header) {
      throw new Error();
    }

    const Authtoken = header.replace("Bearer", "").trim();

    // 2. CRITICAL FIX: Use the secret from .env, not a hardcoded string
    const decoded = jwt.verify(Authtoken, process.env.buyer_password);

    // 3. Find the buyer with this ID and this specific active token
    const buyer = await Buyer.findOne({
      _id: decoded._id,
      "tokens.token": Authtoken,
    });

    // 4. CRITICAL BUG FIX: Check if buyer actually exists
    if (!buyer) {
      throw new Error();
    }

    // 5. Attach the buyer and token to the request for the routes to use
    req.buyer = buyer;
    req.token = Authtoken;

    next(); // Move on to the route logic
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = BuyerAuth;
