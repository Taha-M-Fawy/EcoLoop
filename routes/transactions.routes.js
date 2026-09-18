const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controller/transactions.controller");

// ➕ Create a new transaction
router.post("/", createTransaction);
router.post("/create", createTransaction); // Alias for backward compatibility

// 📖 Get all transactions (supports ?status=, ?itemId=, ?donorOrSellerId=, ?receiverId=)
router.get("/", getTransactions);
router.get("/all", getTransactions); // Alias for backward compatibility

// 🔍 Get a single transaction by ID
router.get("/:id", getTransactionById);

// ✏️ Update a transaction by ID
router.put("/:id", updateTransaction);
router.patch("/:id", updateTransaction); // Support PATCH method as well

// 🗑️ Delete a transaction by ID
router.delete("/:id", deleteTransaction);

module.exports = router;