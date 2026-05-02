const Product = require("../models/product");
const Buyer = require("../models/buyer");
const Seller = require("../models/seller");
const Transaction = require("../models/transaction");

exports.register = async (req, res) => {
  try {
    const buyer = new Buyer(req.body);
    const token = await buyer.getAuthToken();
    res.status(201).send({
      message: "created Buyer id",
      buyer,
      token,
    });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(400).send({ message: "Registration failed", error: e.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const buyer = req.buyer;
    if (!buyer) return res.status(404).send({ message: "buyer not found" });
    res.send({ buyer });
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const to_update = Object.keys(req.body);
  const valid_keys = ["name", "email", "password", "address"];
  const is_valid = to_update.every((update) => valid_keys.includes(update));

  if (!is_valid) return res.status(400).send({ message: "Invalid updates!" });

  try {
    const buyer = req.buyer;
    to_update.forEach((update) => (buyer[update] = req.body[update]));
    await buyer.save();
    res.status(200).send({ buyer });
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await req.buyer.deleteOne();
    res.status(200).send({ message: "buyer deleted" });
  } catch (e) {
    res.status(500).send({ message: "Could not delete buyer" });
  }
};

exports.logout = async (req, res) => {
  try {
    req.buyer.tokens = req.buyer.tokens.filter(
      (token) => token.token !== req.token,
    );
    await req.buyer.save();
    res.status(200).send({ message: "buyer logged out" });
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const buyer = await Buyer.FindByCredentials(
      req.body.email,
      req.body.password,
    );
    const token = await buyer.getAuthToken();
    res.status(200).send({ buyer, token });
  } catch (e) {
    res.status(400).send({ message: "Unable to login, check credentials" });
  }
};

exports.buyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    const isTransacted = await Transaction.findOne({
      product_id: req.params.id,
    });
    if (isTransacted) {
      return res.status(400).send({ message: "Product already sold" });
    }

    const seller = await Seller.findById(product.owner);

    const transaction = new Transaction({
      seller_id: product.owner,
      buyer_id: req.buyer._id,
      product_id: product._id,
    });

    await transaction.save();
    await product.deleteOne();

    res.status(200).send({
      message: "transaction complete",
      details: {
        buyer: req.buyer.name,
        seller: seller ? seller.name : "Unknown Seller",
        price: product.price,
      },
      transaction,
    });
  } catch (e) {
    res.status(500).send({ message: "Transaction failed", error: e.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).send({ products });
  } catch (e) {
    res.status(500).send({ message: "Could not fetch products" });
  }
};
