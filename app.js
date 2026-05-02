const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const SellerRoute = require("./routes/seller");
const BuyerRoute = require("./routes/buyer");
require("./db/connection");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", SellerRoute);
app.use("/api", BuyerRoute);

// Define the port from .env or default to 3031 as requested
const PORT = process.env.PORT || 3031;

app.get("/health", (req, res) => {
  res.send({
    message: "Server is healthy",
    version: "1.1.0",
    refactored: true
  });
});

// Fallback to index.html for any other route (SPA behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
