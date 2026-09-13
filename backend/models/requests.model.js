const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  governorate: {
    type: String,
    required: true,
    trim: true
  },

  city: {
    type: String,
    required: true,
    trim: true
  },

  urgency: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open"
  }
});

module.exports = mongoose.model("Request", requestSchema);