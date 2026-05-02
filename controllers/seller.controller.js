const Seller = require("../models/seller");
const Product = require("../models/product");

exports.register = async (req, res) => {
  try {
    const seller = new Seller(req.body);
    const token = await seller.getAuthtoken();
    res.status(201).send({ message: "created seller id", seller, token });
  } catch (e) {
    console.error("Seller Registration error:", e);
    res.status(400).send({ message: "Registration failed. Email may already exist.", error: e.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const seller = req.seller;
    if (!seller) return res.status(404).send({ message: "not found" });
    res.status(200).send(seller);
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const to_update = Object.keys(req.body);
  const valid_keys = ["name", "email", "password"];
  const is_valid = to_update.every((update) => valid_keys.includes(update));

  if (!is_valid) return res.status(400).send({ message: "Invalid update fields" });

  try {
    const seller = req.seller;
    to_update.forEach((update) => (seller[update] = req.body[update]));
    await seller.save();
    res.status(200).send(seller);
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const seller = await Seller.deleteOne({ _id: sellerId });
    await Product.deleteMany({ owner: sellerId });
    res.status(200).send({ message: "seller and their products deleted", seller });
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const seller = await Seller.findByCredentials(req.body.email, req.body.password);
    const token = await seller.getAuthtoken();
    res.status(200).send({ seller, token });
  } catch (e) {
    res.status(400).send({ message: "Login failed. Check credentials." });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      owner: req.seller._id,
      clicks: 0,
    });
    await product.save();
    res.status(201).send({ message: "product added", product });
  } catch (e) {
    res.status(400).send({ message: "Could not add product", error: e.message });
  }
};

exports.updateProduct = async (req, res) => {
  const updates = Object.keys(req.body);
  const validkeys = ["item_name", "description", "category", "price"];
  const validrequest = updates.every((update) => validkeys.includes(update));

  if (!validrequest) return res.status(400).send({ error: "Invalid updates" });

  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.seller._id,
    });
    if (!product) return res.status(404).send({ error: "Product not found" });

    updates.forEach((update) => (product[update] = req.body[update]));
    await product.save();
    res.status(200).send({ product });
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.deleteOne({
      _id: req.params.id,
      owner: req.seller._id,
    });
    if (result.deletedCount === 0) return res.status(404).send({ message: "Product not found" });
    res.status(200).send({ message: "product deleted" });
  } catch (e) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const skip = parseInt(req.params.skip) || 0;
    const limit = parseInt(req.params.limit) || 10;

    const products = await Product.find({ owner: req.seller._id })
      .sort({ item_name: "desc" })
      .skip(skip)
      .limit(limit);
    res.status(200).send({ products });
  } catch (err) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.limit) || 10;
    const searchText = req.body.searchText || "";

    const reg = new RegExp(searchText, "i");
    const products = await Product.find({
      owner: req.seller._id,
      $or: [{ item_name: reg }, { description: reg }, { category: reg }],
    })
      .sort({ item_name: "desc" })
      .skip(skip)
      .limit(limit);

    res.status(200).send({ products });
  } catch (err) {
    res.status(500).send({ message: "internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) return res.status(404).send({ message: "Product not found" });

    product.clicks = (product.clicks || 0) + 1;
    await product.save();

    res.status(200).send({ product });
  } catch (err) {
    res.status(500).send({ message: "internal server error" });
  }
};
