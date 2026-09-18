const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/db.config");

const app = express();

// Middleware for parsing JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "EcoLoop API Server is running" });
});

// Transactions Routes
const transactionRoutes = require("./routes/transactions.routes");
app.use("/api/transactions", transactionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;