const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      default: null
    },
    donorOrSellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المانح/البائع مطلوب']
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستلم مطلوب']
    },
    handshakeOTP: {
      type: String,
      default: () => Math.floor(100000 + Math.random() * 900000).toString(),
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending'
    },
    itemPrice: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ donorOrSellerId: 1, status: 1 });
transactionSchema.index({ receiverId: 1, status: 1 });
transactionSchema.index({ itemId: 1 });
transactionSchema.index({ requestId: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema, 'transactions');
