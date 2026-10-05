require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in req.body

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
  }
};

startServer();