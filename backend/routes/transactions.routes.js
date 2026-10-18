const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
  payTransaction,
  getFinancialStats
} = require('../controller/transactions.controller');

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, getTransactions);
router.get('/stats/financial', protect, getFinancialStats);
router.get('/:id', protect, getTransactionById);
router.patch('/:id/status', protect, updateTransactionStatus);
router.put('/:id/status', protect, updateTransactionStatus);
router.patch('/:id/pay', protect, payTransaction);
router.post('/:id/pay', protect, payTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
