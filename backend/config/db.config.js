const mongoose = require("mongoose");
const { MONGO_URI } = require("./env.config.js");

const defaultUri = "mongodb://tahafawy2_db_user:admin123456@ac-upgxxry-shard-00-00.g0fs4cs.mongodb.net:27017,ac-upgxxry-shard-00-01.g0fs4cs.mongodb.net:27017,ac-upgxxry-shard-00-02.g0fs4cs.mongodb.net:27017/EcoLoop?ssl=true&authSource=admin&replicaSet=atlas-2v7rj7-shard-0&readPreference=primaryPreferred&retryWrites=true&w=majority";

const connectionUri = MONGO_URI || defaultUri;

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`Connected to MongoDB successfully: ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (err) {
    isConnecting = false;
    console.error("Error from MongoDB connection:", err.message);
    console.log("Retrying MongoDB connection in 3 seconds...");
    setTimeout(connectDB, 3000);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected! Retrying in 3 seconds...");
  setTimeout(connectDB, 3000);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully!");
});

module.exports = { connectDB };