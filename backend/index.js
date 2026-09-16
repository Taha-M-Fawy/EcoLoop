<<<<<<< Updated upstream
const express = require("express");
=======
const express = require('express');
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');

// Routes Imports
const itemRoutes = require('./routes/item.routes');
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const reviewsRoutes = require('./routes/reviews.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const requestsRoutes = require('./routes/requests.routes');
// Middlewares Imports
const errorHandler = require('./middlewares/errorHandler');

>>>>>>> Stashed changes
const app = express();

const { connectDB } = require("./config/db.config.js");
const { PORT } = require("./config/env.config.js");

<<<<<<< Updated upstream
//*---MIDDLEWARES---
app.use(express.json()); // Built-in middleware to parse JSON

//*---TEST ROUTE (Home)---
app.get("/", (req, res) => {
  res.send("EcoLoop Server is working successfully!");
});
//*---CONNECT DB & START SERVER---
connectDB();
=======
//*--- API ROUTES ---*//
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/requests', requestsRoutes);
//*--- ERROR HANDLING MIDDLEWARE ---*//
app.use(errorHandler);
>>>>>>> Stashed changes

app.listen(PORT, () => {
  console.log(`my app listening on port ${PORT} successfully`);
});