const mongoose = require('mongoose')


const reviewSchema = new mongoose.Schema({
    transactionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Transaction',
        required : true
    },
    reviewerId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    reviewedUserId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    rating : {
        type : Number,
        required: true,
        min : 1,
        max : 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);


