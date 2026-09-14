const express = require('express');
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');


const itemRoutes = require('./routes/item.routes');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const reviewsRoutes = require("./routes/reviews.routes.js"); 

const app = express();

app.use(express.json());
app.use('/api/items', itemRoutes);

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
//Reviews Routes 


//*---MIDDLEWARES---
app.use(express.json()); // Built-in middleware to parse JSON

app.use(errorHandler);

const serverPort = PORT || 5000;

connectDB().then(() => {
  app.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });
});


//*---ROUTES---
app.use("/api/reviews", reviewsRoutes); // NEW



//*---CONNECT DB & START SERVER---
connectDB();

app.listen(PORT, () => {
  console.log(`my app listening on port ${PORT} successfully`);
});
