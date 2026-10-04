const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const dotenv = require('dotenv');
if (dotenv && typeof dotenv.config === 'function') {
  dotenv.config();
}

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in req.body

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));