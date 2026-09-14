const express = require('express');
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

app.use(errorHandler);

const serverPort = PORT || 5000;

connectDB().then(() => {
  app.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });
});
