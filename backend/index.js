const express = require('express');
const cors = require('cors');
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

const app = express();
app.use(cors());

// Global Middleware
app.use(express.json());

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/requests', requestsRoutes);

// Error Handling
app.use(errorHandler);

// Connect DB & Start Server
const serverPort = PORT || 5000;

connectDB()
  .then(() => {
    app.listen(serverPort, () => {
      console.log(`Server running successfully on port ${serverPort}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
  });