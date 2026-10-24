
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function mergeCategories() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const result = await Product.updateMany(
      {
        category: { $regex: /^home\s*decor$/i },
      },
      {
        $set: { category: 'Home & Decor' },
      }
    );

    console.log('Home decor categories matched:', result.matchedCount);
    console.log('Products updated:', result.modifiedCount);

    const remaining = await Product.countDocuments({
      category: { $regex: /^home\s*decor$/i },
    });

    console.log('Remaining Home Decor products:', remaining);
  } catch (error) {
    console.error('Category merge failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

mergeCategories();
