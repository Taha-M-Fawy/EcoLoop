const mongoose = require("mongoose");

// Ensure referenced models are loaded before registering Transaction model
require("./items.model");
require("./users.model");
require("./requests.model");

const transactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "itemId (Item reference) is required"],
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: false,
    },

    donorOrSellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "donorOrSellerId (User reference) is required"],
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "receiverId (User reference) is required"],
    },

    handshakeOTP: {
      type: String,
      trim: true,
      minlength: 4,
      maxlength: 10,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);