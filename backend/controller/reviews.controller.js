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


//*---CREATE REVIEW---
const createReview = (req, res) => {

  const {
    reviewerId,
    reviewedUserId,
    rating,
    comment
  } = req.body;

  createReviewService({
    reviewerId,
    reviewedUserId,
    rating,
    comment
  })

    .then((review) => {

      return createNotificationService({
        userId: reviewedUserId,
        message: `You received a new review with ${rating} stars.`,
        type: 'review'
      })

        .then(() => {

          res.status(201).json(review);

        });

    })

    .catch((error) => {

      res.status(400).json({
        message: error.message
      });

    });

};

//*---GET ALL REVIEWS---
const getReviews = (req, res) => {

    const userId = req.user.id;

    getReviewsService(userId)

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