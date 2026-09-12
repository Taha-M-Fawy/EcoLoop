const express = require('express');
const { connectDB } = require('./config/db.config');
const { PORT } = require('./config/env.config');


const itemRoutes = require('./routes/item.routes');

const app = express();

app.use(express.json());
app.use('/api/items', itemRoutes);

const serverPort = PORT || 5000;

connectDB().then(() => {
  app.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });
});