const {
  createReviewService,
  getReviewsService,
  getReviewByIdService,
  updateReviewService,
  deleteReviewService
} = require("../services/reviews.service.js");

//*---CREATE REVIEW---
const createReview = (req, res) => {
  const { transactionId, reviewerId, reviewedUserId, rating, comment } = req.body;

  createReviewService({ transactionId, reviewerId, reviewedUserId, rating, comment })
    .then((review) => {
      res.status(201).json(review);
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
};

//*---GET ALL REVIEWS---
const getReviews = (req, res) => {
  getReviewsService()
    .then((reviews) => {
      res.status(200).json(reviews);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

//*---GET SINGLE REVIEW---
const getReviewById = (req, res) => {
  getReviewByIdService(req.params.id)
    .then((review) => {
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(200).json(review);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

//*---UPDATE REVIEW---
const updateReview = (req, res) => {
  updateReviewService(req.params.id, req.body)
    .then((review) => {
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(200).json(review);
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
};

//*---DELETE REVIEW---
const deleteReview = (req, res) => {
  deleteReviewService(req.params.id)
    .then((review) => {
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(200).json({ message: "Review deleted successfully" });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview
};