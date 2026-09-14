const express = require('express');
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');

// Routes Imports
const itemRoutes = require('./routes/item.routes');
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const reviewsRoutes = require('./routes/reviews.routes');
const notificationsRoutes = require('./routes/notifications.routes');

// Middlewares Imports
const errorHandler = require('./middlewares/errorHandler');

const app = express();

//*--- GLOBAL MIDDLEWARES ---*//
app.use(express.json());

//*--- API ROUTES ---*//
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);

//*--- ERROR HANDLING MIDDLEWARE ---*//
app.use(errorHandler);

//*--- CONNECT DB & START SERVER ---*//
const serverPort = PORT || 5000;

connectDB().then(() => {
  app.listen(serverPort, () => {
    console.log(`Server running successfully on port ${serverPort}`);
  });
}).catch((err) => {
  console.error('Failed to connect to DB:', err);
});