const express = require("express");

const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview
} = require("../controller/reviews.controller.js");

const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/", createReview);

router.get("/", protect, getReviews);

router.get("/:id", protect, getReviewById);

router.put("/:id", protect, updateReview);

router.delete("/:id", protect, deleteReview);

module.exports = router;