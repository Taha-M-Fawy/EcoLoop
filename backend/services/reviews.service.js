const Review = require("../models/reviews.model.js");

const createReviewService = (data) => {
  return Review.create(data);
};

const getReviewsService = (userId, isAdmin = false) => {
    if (isAdmin && !userId) {
      return Review.find({}).sort({ createdAt: -1 }).populate('reviewerId', 'username email phone').populate('reviewedUserId', 'username email').lean();
    }
    const filter = userId ? { reviewedUserId: userId } : {};
    return Review.find(filter).sort({ createdAt: -1 }).populate('reviewerId', 'username profileImage phone').lean();
};

const getReviewByIdService = (id) => {
  return Review.findById(id).populate('reviewerId', 'username profileImage').lean();
};

const updateReviewService = (id, data) => {
  return Review.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
};

const deleteReviewService = (id) => {
  return Review.findByIdAndDelete(id);
};

module.exports = {
  createReviewService,
  getReviewsService,
  getReviewByIdService,
  updateReviewService,
  deleteReviewService
};