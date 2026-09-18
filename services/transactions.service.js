const mongoose = require("mongoose");
const Transaction = require("../models/transactions.model");

/**
 * Helper to check if string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Helper to auto-generate a 6-digit handshake OTP if not provided
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a new Transaction
 * @param {Object} data - Transaction details
 */
const createTransactionService = async (data) => {
  const { itemId, requestId, donorOrSellerId, receiverId, handshakeOTP, status } = data;

  // Validate required ObjectIds
  if (!itemId || !isValidObjectId(itemId)) {
    throw new Error("Invalid or missing itemId ObjectId");
  }
  if (!donorOrSellerId || !isValidObjectId(donorOrSellerId)) {
    throw new Error("Invalid or missing donorOrSellerId ObjectId");
  }
  if (!receiverId || !isValidObjectId(receiverId)) {
    throw new Error("Invalid or missing receiverId ObjectId");
  }
  if (requestId && !isValidObjectId(requestId)) {
    throw new Error("Invalid requestId ObjectId format");
  }

  // Generate handshake OTP if not supplied
  const otp = handshakeOTP ? handshakeOTP.toString().trim() : generateOTP();

  const newTransaction = new Transaction({
    itemId,
    requestId: requestId || undefined,
    donorOrSellerId,
    receiverId,
    handshakeOTP: otp,
    status: status || "pending",
  });

  const savedTransaction = await newTransaction.save();

  // Populate reference models for complete response
  return await Transaction.findById(savedTransaction._id)
    .populate("itemId")
    .populate("donorOrSellerId", "-password")
    .populate("receiverId", "-password")
    .populate("requestId");
};

/**
 * Get all Transactions with optional filter & population
 * @param {Object} filter - Search/filter query object
 */
const getTransactionsService = async (filter = {}) => {
  return await Transaction.find(filter)
    .populate("itemId")
    .populate("donorOrSellerId", "-password")
    .populate("receiverId", "-password")
    .populate("requestId")
    .sort({ createdAt: -1 });
};

/**
 * Get a single Transaction by ID with population
 * @param {String} id - Transaction ObjectId
 */
const getTransactionByIdService = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid Transaction ID format");
  }

  return await Transaction.findById(id)
    .populate("itemId")
    .populate("donorOrSellerId", "-password")
    .populate("receiverId", "-password")
    .populate("requestId");
};

/**
 * Update a Transaction by ID
 * @param {String} id - Transaction ObjectId
 * @param {Object} updateData - Data fields to update
 */
const updateTransactionService = async (id, updateData) => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid Transaction ID format");
  }

  // Validate ObjectIds if they are included in updateData
  if (updateData.itemId && !isValidObjectId(updateData.itemId)) {
    throw new Error("Invalid itemId ObjectId format");
  }
  if (updateData.donorOrSellerId && !isValidObjectId(updateData.donorOrSellerId)) {
    throw new Error("Invalid donorOrSellerId ObjectId format");
  }
  if (updateData.receiverId && !isValidObjectId(updateData.receiverId)) {
    throw new Error("Invalid receiverId ObjectId format");
  }
  if (updateData.requestId && !isValidObjectId(updateData.requestId)) {
    throw new Error("Invalid requestId ObjectId format");
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate("itemId")
    .populate("donorOrSellerId", "-password")
    .populate("receiverId", "-password")
    .populate("requestId");

  return updatedTransaction;
};

/**
 * Delete a Transaction by ID
 * @param {String} id - Transaction ObjectId
 */
const deleteTransactionService = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid Transaction ID format");
  }

  return await Transaction.findByIdAndDelete(id);
};

module.exports = {
  isValidObjectId,
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
};
