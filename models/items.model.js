const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["available", "reserved", "completed"],
      default: "available",
    },
  },
  {
    timestamps: true,
    collection: "items",
  }
);

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
