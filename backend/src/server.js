require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CraftLocal backend is running!' });
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('CraftLocal backend startup successful');
      console.log('Configured port:', PORT);
      console.log('Actual server address:', server.address());
      console.log('Server listening:', server.listening);
    });

    server.on('error', (error) => {
      console.error('SERVER LISTEN ERROR:', error);
    });

    server.on('close', () => {
      console.error('SERVER CLOSED');
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exitCode = 1;
  }
}

startServer();