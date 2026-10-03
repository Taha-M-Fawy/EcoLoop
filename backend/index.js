const express = require('express');
const cors = require('cors'); 
const compression = require('compression');
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');

// Routes Imports
const itemRoutes = require('./routes/item.routes');
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const reviewsRoutes = require('./routes/reviews.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const locationRoutes = require('./routes/location.routes');
const requestRoutes = require('./routes/requests.routes');
const transactionRoutes = require('./routes/transactions.routes');

// Middlewares Imports
const errorHandler = require('./middlewares/errorHandler');

const app = express();

//*--- APP SETTINGS & GLOBAL MIDDLEWARES ---*//
app.use(compression());

const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

//*--- API ROUTES ---*//
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

//*--- ERROR HANDLING MIDDLEWARE ---*//
app.use(errorHandler);

//*--- START SERVER & CONNECT DB ---*//
const serverPort = PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(serverPort, () => {
    console.log(`Server running successfully on port ${serverPort}`);
    connectDB().catch((err) => {
      console.error('Failed to connect to DB:', err.message);
    });
  });
} else {
  connectDB().catch((err) => {
    console.error('Failed to connect to DB:', err.message);
  });
}

module.exports = app;