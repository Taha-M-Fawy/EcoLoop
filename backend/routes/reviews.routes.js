const express = require("express");
const router = express.Router();

const {createReview,getReviews,getReviewById,updateReview,deleteReview} = require("../controller/reviews.controller");


// router.post('/' , createReview)
// router.get('/' , getReviews)
// router.get('/' , getReviewById)
// router.put('/' , updateReview)
// router.delete('/' , deleteReview)

router.route('/')
    .post(createReview)
    .get(getReviews)

router.route('/:id')
    .get( getReviewById)
    .put( updateReview)
    .delete( deleteReview)

module.exports = router;