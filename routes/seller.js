const express = require("express");
const Auth = require("../middleware/Sellerauth");
const sellerController = require("../controllers/seller.controller");

const SellerRouter = express.Router();

// --- REGISTER ---
SellerRouter.post("/seller/register", sellerController.register);

// --- LOGIN ---
SellerRouter.post("/seller/login", sellerController.login);

// --- GET PROFILE ---
SellerRouter.get("/seller/me", Auth, sellerController.getProfile);

// --- UPDATE PROFILE ---
SellerRouter.patch("/seller/me", Auth, sellerController.updateProfile);

// --- DELETE PROFILE & PRODUCTS ---
SellerRouter.delete("/seller/me", Auth, sellerController.deleteProfile);

// --- PRODUCT MANAGEMENT ---
SellerRouter.post("/seller/product/add", Auth, sellerController.addProduct);
SellerRouter.patch("/seller/product/:id", Auth, sellerController.updateProduct);
SellerRouter.delete("/seller/product/:id", Auth, sellerController.deleteProduct);

// --- PAGINATED PRODUCT LIST ---
SellerRouter.get("/seller/products/:skip/:limit", Auth, sellerController.getSellerProducts);

// --- SEARCH ---
SellerRouter.post("/seller/products/search", Auth, sellerController.searchProducts);

// --- PUBLIC PRODUCT VIEW ---
SellerRouter.get("/seller/product/:id", sellerController.getProductById);

module.exports = SellerRouter;
