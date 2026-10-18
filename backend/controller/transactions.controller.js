const {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionStatusService,
  deleteTransactionService,
  payTransactionService,
  getFinancialStatsService
} = require('../services/transactions.service');

const createTransaction = async (req, res, next) => {
  try {
    const { 
      itemId, 
      requestId, 
      donorOrSellerId, 
      receiverId, 
      notes, 
      paymentMethod, 
      paymentDetails, 
      isPaid 
    } = req.body;
    const currentUserId = req.user.id;

    // If caller didn't pass donor/receiver explicitly, determine from context
    const finalReceiverId = receiverId || currentUserId;
    const finalDonorId = donorOrSellerId || currentUserId;

    const role = req.user?.role || 'user';

    const transaction = await createTransactionService({
      itemId,
      requestId,
      donorOrSellerId: finalDonorId,
      receiverId: finalReceiverId,
      notes,
      paymentMethod,
      paymentDetails,
      isPaid
    }, currentUserId, role);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المعاملة بنجاح',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const role = req.user.role || 'user';
    const transactions = await getTransactionsService(currentUserId, role, req.query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const role = req.user?.role || 'user';
    const transaction = await getTransactionByIdService(req.params.id, currentUserId, role);

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const updateTransactionStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const role = req.user?.role || 'user';
    const { status, otp, notes } = req.body;

    const transaction = await updateTransactionStatusService(req.params.id, currentUserId, {
      status,
      otp,
      notes
    }, role);

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة المعاملة بنجاح',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    await deleteTransactionService(req.params.id, currentUserId);

    res.status(200).json({
      success: true,
      message: 'تم حذف المعاملة بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const payTransaction = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const role = req.user?.role || 'user';
    const { paymentMethod, paymentDetails } = req.body;

    const transaction = await payTransactionService(
      req.params.id,
      currentUserId,
      { paymentMethod, paymentDetails },
      role
    );

    res.status(200).json({
      success: true,
      message: 'تم سداد المعاملة بنجاح عبر كاش وحفظ المبلغ في أمان المنصة',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getFinancialStats = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const role = req.user?.role || 'user';

    const stats = await getFinancialStatsService(currentUserId, role);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
  payTransaction,
  getFinancialStats
};
