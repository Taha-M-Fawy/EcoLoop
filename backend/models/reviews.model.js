const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

reviewSchema.index({ transactionId: 1 });
reviewSchema.index({ reviewedUserId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });

module.exports = mongoose.model('Review', reviewSchema);