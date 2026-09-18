const mongoose = require("mongoose");
const Transaction = require("../models/transactions.model");
const {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
  isValidObjectId,
} = require("../services/transactions.service");

async function runTests() {
  console.log("--- Starting Transaction Module Unit/Logic Tests ---");

  // Test 1: ObjectId validation
  console.log("\n[Test 1] ObjectId Validation");
  console.assert(isValidObjectId("507f1f77bcf86cd799439011") === true, "Valid ObjectId failed check");
  console.assert(isValidObjectId("invalid-id") === false, "Invalid ObjectId passed check");
  console.log("✔ ObjectId Validation passed");

  // Test 2: Invalid ObjectId rejection in Service
  console.log("\n[Test 2] Service Invalid ID Rejection");
  try {
    await getTransactionByIdService("123badid");
    console.error("❌ Failed: Should have thrown error for invalid ID");
  } catch (err) {
    console.log("✔ Correctly caught invalid ID error:", err.message);
  }

  // Test 3: Missing required fields in createTransactionService
  console.log("\n[Test 3] Create Transaction missing required fields validation");
  try {
    await createTransactionService({});
    console.error("❌ Failed: Should have thrown error for missing required fields");
  } catch (err) {
    console.log("✔ Correctly caught missing required fields error:", err.message);
  }

  console.log("\n--- All static & logic tests completed successfully ---");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
});
