const mongoose = require("mongoose");
const { MONGO_URI } = require("./env.config.js");

const connectDB = () => {
  return mongoose
    .connect(MONGO_URI)
    .then(() => console.log("connected to db successfully !"))
    .catch((err) => console.log("error from db", err));
};

module.exports = { connectDB };