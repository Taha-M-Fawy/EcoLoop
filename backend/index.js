const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
=======
const cors = require('cors'); 
>>>>>>> main
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');

// Routes Imports
const itemRoutes = require('./routes/item.routes');
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const reviewsRoutes = require('./routes/reviews.routes');
const notificationsRoutes = require('./routes/notifications.routes');
<<<<<<< HEAD
const requestsRoutes = require('./routes/requests.routes');

=======
const locationRoutes = require('./routes/location.routes');
>>>>>>> main
// Middlewares Imports
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cors());

<<<<<<< HEAD
// Global Middleware
=======

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

>>>>>>> main
app.use(express.json());

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
<<<<<<< HEAD
app.use('/api/requests', requestsRoutes);

// Error Handling
app.use(errorHandler);

// Connect DB & Start Server
=======
app.use('/api/locations', locationRoutes);
//*--- ERROR HANDLING MIDDLEWARE ---*//
app.use(errorHandler);
app.set('etag', false);
//*--- CONNECT DB & START SERVER ---*//
>>>>>>> main
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