const express = require("express");
const Auth = require("../middleware/Buyerauth");
const buyerController = require("../controllers/buyer.controller");

const BuyerRouter = express.Router();

// --- REGISTER ---
BuyerRouter.post("/buyer/register", buyerController.register);

// --- LOGIN ---
BuyerRouter.post("/buyer/login", buyerController.login);

// --- GET PROFILE ---
BuyerRouter.get("/buyer/me", Auth, buyerController.getProfile);

// --- UPDATE PROFILE ---
BuyerRouter.patch("/buyer/me", Auth, buyerController.updateProfile);

// --- DELETE PROFILE ---
BuyerRouter.delete("/buyer/me", Auth, buyerController.deleteProfile);

// --- LOGOUT ---
BuyerRouter.post("/buyer/logout", Auth, buyerController.logout);

// --- BUY PRODUCT ---
BuyerRouter.post("/buyer/buy/:id", Auth, buyerController.buyProduct);

// --- GET ALL PRODUCTS (for Buyer Dashboard) ---
BuyerRouter.get("/buyer/products", Auth, buyerController.getAllProducts);

module.exports = BuyerRouter;
