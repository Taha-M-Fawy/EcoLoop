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
    },
    paymentMethod: {
      type: String,
      enum: ['vodafone_cash', 'orange_cash', 'etisalat_cash', 'we_pay', 'instapay', 'cash_wallet', 'none'],
      default: 'none'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded'],
      default: 'unpaid'
    },
    paidAt: {
      type: Date,
      default: null
    },
    paymentDetails: {
      senderWalletNumber: { type: String, default: '' },
      receiverWalletNumber: { type: String, default: '' },
      transactionRef: { type: String, default: '' },
      provider: { type: String, default: '' },
      paidAmount: { type: Number, default: 0 }
    },
    platformCommissionRate: {
      type: Number,
      default: 0.05
    },
    sellerEarnings: {
      type: Number,
      default: 0
    },
    escrowStatus: {
      type: String,
      enum: ['none', 'holding', 'released', 'refunded'],
      default: 'none'
    },
    escrowReleasedAt: {
      type: Date,
      default: null
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
