const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleProducts = [
  {
    name: "Handcrafted Terracotta Vase",
    title: "Handcrafted Terracotta Vase",
    description: "Earthy handmade terracotta clay vase crafted by local artisans.",
    price: 45.00,
    category: "Home Decor",
    stock: 12,
    image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=500",
    images: ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=500"]
  },
  {
    name: "Handwoven Cotton Throw Blanket",
    title: "Handwoven Cotton Throw Blanket",
    description: "100% organic cotton handwoven on traditional wooden looms.",
    price: 65.00,
    category: "Textiles",
    stock: 8,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500",
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500"]
  },
  {
    name: "Handcarved Wooden Bowl",
    title: "Handcarved Wooden Bowl",
    description: "Sustainably sourced teak wood bowl polished with natural beeswax.",
    price: 32.50,
    category: "Kitchenware",
    stock: 15,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500",
    images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500"]
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const existingProducts = await Product.find({ title: { $in: sampleProducts.map((product) => product.title) } }).select('title');
    const existingTitles = new Set(existingProducts.map((product) => product.title));
    const productsToInsert = sampleProducts.filter((product) => !existingTitles.has(product.title));
    if (productsToInsert.length > 0) {
      await Product.insertMany(productsToInsert);
    }
    
    console.log(`Seeded ${productsToInsert.length} sample product(s).`);
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDB();