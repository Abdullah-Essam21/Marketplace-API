const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGOURL;

if (!url) {
  console.error("Error: MONGOURL is not defined in the .env file");
  process.exit(1);
}

mongoose
  .connect(url)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Removed outdated options:
// useNewUrlParser, useUnifiedTopology, useCreateIndex are no longer needed
// in modern Mongoose versions.
