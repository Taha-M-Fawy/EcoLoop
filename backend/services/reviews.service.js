const Review = require("../models/reviews.model.js");

const createReviewService = (data) => {
  return Review.create(data);
};

const getReviewsService = () => {
  return Review.find();
};

const getReviewByIdService = (id) => {
  return Review.findById(id);
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