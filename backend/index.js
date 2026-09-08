const express = require("express");
const app = express();

const { connectDB } = require("./config/db.config.js");
const { PORT } = require("./config/env.config.js");

//*---MIDDLEWARES---
app.use(express.json()); // Built-in middleware to parse JSON

//*---TEST ROUTE (Home)---
app.get("/", (req, res) => {
  res.send("EcoLoop Server is working successfully!");
});
//*---CONNECT DB & START SERVER---
connectDB();

app.listen(PORT, () => {
  console.log(`my app listening on port ${PORT} successfully`);
});