const {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
} = require("../services/transactions.service");

/**
 * CREATE a new Transaction
 * POST /api/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const transaction = await createTransactionService(req.body);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    const isValidationError =
      error.name === "ValidationError" ||
      error.message.includes("Invalid") ||
      error.message.includes("required");

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL Transactions (supports optional query filters like status, donorOrSellerId, etc.)
 * GET /api/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.donorOrSellerId) filter.donorOrSellerId = req.query.donorOrSellerId;
    if (req.query.receiverId) filter.receiverId = req.query.receiverId;
    if (req.query.itemId) filter.itemId = req.query.itemId;

    const transactions = await getTransactionsService(filter);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET single Transaction by ID
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const transaction = await getTransactionByIdService(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    const isBadRequest = error.message.includes("Invalid");
    return res.status(isBadRequest ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE Transaction by ID
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res) => {
  try {
    const transaction = await updateTransactionService(
      req.params.id,
      req.body
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    const isBadRequest =
      error.name === "ValidationError" || error.message.includes("Invalid");
    return res.status(isBadRequest ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE Transaction by ID
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await deleteTransactionService(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: transaction,
    });
  } catch (error) {
    const isBadRequest = error.message.includes("Invalid");
    return res.status(isBadRequest ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};