const {
  createReviewService,
  getReviewsService,
  getReviewByIdService,
  updateReviewService,
  deleteReviewService
} = require("../services/reviews.service.js");

const {
  createNotificationService
} = require("../services/notifications.service.js");

const Review = require("../models/reviews.model.js");
const User = require("../models/user.model.js");

//*---CREATE REVIEW---
const createReview = async (req, res) => {
  const reviewerId = req.user?.id || req.body.reviewerId;
  const {
    transactionId,
    reviewedUserId,
    rating,
    comment
  } = req.body;

  if (!reviewerId) {
    return res.status(401).json({ message: "Authentication required to submit review" });
  }

  if (!reviewedUserId) {
    return res.status(400).json({ message: "Target user ID is required" });
  }

  if (String(reviewerId) === String(reviewedUserId)) {
    return res.status(400).json({ message: "You cannot review yourself" });
  }

  try {
    const review = await createReviewService({
      transactionId: transactionId || null,
      reviewerId,
      reviewedUserId,
      rating: Number(rating),
      comment: comment ? comment.trim() : ''
    });

    // Update target user's ratingAverage and ratingQuantity
    try {
      const allUserReviews = await Review.find({ reviewedUserId });
      const ratingQuantity = allUserReviews.length;
      const totalRating = allUserReviews.reduce((sum, r) => sum + r.rating, 0);
      const ratingAverage = Math.round((totalRating / (ratingQuantity || 1)) * 10) / 10;

      await User.findByIdAndUpdate(reviewedUserId, {
        ratingAverage,
        ratingQuantity,
        $inc: { impactScore: 5 }
      });
    } catch (e) {
      console.error('Failed to update user rating metrics:', e);
    }

    // Notify target user
    createNotificationService({
      userId: reviewedUserId,
      title: 'تقييم جديد لحسابك ⭐',
      message: `حصلت على تقييم جديد (${rating} نجوم) من أحد أعضاء المجتمع!`,
      type: 'review',
      relatedEntityId: review._id,
      entityType: 'Review'
    }).catch(() => {});

    // Notify reviewer (confirmation)
    createNotificationService({
      userId: reviewerId,
      title: 'شكراً لتقييمك! ⭐',
      message: `تم إرسال تقييمك (${rating} نجوم) بنجاح. شكراً لمساهمتك في زيادة موثوقية مجتمع EcoLoop!`,
      type: 'review',
      relatedEntityId: review._id,
      entityType: 'Review'
    }).catch(() => {});

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

//*---GET ALL REVIEWS---
const getReviews = (req, res) => {
    const isAdmin = req.user?.role === 'admin';
    const targetUserId = req.query.userId || (isAdmin && !req.query.userId ? null : (req.user?.id || null));

    getReviewsService(targetUserId, isAdmin)
        .then((reviews) => {
            res.status(200).json(reviews);
        })
        .catch((error) => {
            res.status(400).json({
                message: error.message
            });
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