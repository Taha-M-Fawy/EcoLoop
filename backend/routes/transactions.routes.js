const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction
} = require('../controller/transactions.controller');

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransactionById);
router.patch('/:id/status', protect, updateTransactionStatus);
router.put('/:id/status', protect, updateTransactionStatus);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
