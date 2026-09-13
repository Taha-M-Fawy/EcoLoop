const Review = require('../models/reviews.model')


// Create Review (POST)
const createReview = (req,res) => {

    const {transactionId, reviewerId, reviewedUserId, rating, comment} = req.body;

    Review.create({
        transactionId,
        reviewerId,
        reviewedUserId,
        rating,
        comment
    })
    .then((review) => {
        res.status(201).json(review);
    })
    .catch((error) => {
        res.status(400).json({ message: error.message });
    })
}


// GET ALL REVIEWS 
const getReviews = (req,res) =>{
    Review.find()
        //.populate("reviewerId", "name")
        //.populate("reviewedUserId", "name")
        .then((reviews) => {
            res.status(200).json(reviews);
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        })
}


//*---GET SINGLE REVIEW---
const getReviewById = (req, res) => {

    Review.findById(req.params.id)
        //.populate("reviewerId", "name")
        //.populate("reviewedUserId", "name")
        .then((review) => {
            if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
            res.status(200).json(review);
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        })
}


//*---UPDATE REVIEW---
const updateReview = (req, res) => {
    Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    .then((review) => {
        if (!review) {
        return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json(review);
    })
    .catch((error) => {
        res.status(400).json({ message: error.message });
    })
}



//*---DELETE REVIEW---
const deleteReview = (req, res) => {
    Review.findByIdAndDelete(req.params.id)
    .then((review) => {
        if (!review) {
        return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({ message: "Review deleted successfully" });
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    })
}




module.exports = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
}