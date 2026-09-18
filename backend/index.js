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
const locationRoutes = require('./routes/location.routes');

// Middlewares Imports
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Settings & Global Middlewares
app.set('etag', false);

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/locations', locationRoutes);

// Error Handling Middleware (Always after routes)
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