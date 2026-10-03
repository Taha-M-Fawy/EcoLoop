const express = require("express");

const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview
} = require("../controller/reviews.controller.js");

const { protect, optionalProtect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/", optionalProtect, getReviews);
router.get("/:id", optionalProtect, getReviewById);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;