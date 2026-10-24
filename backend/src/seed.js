
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleProducts = [
  // Original products
  {
    name: 'Handcrafted Terracotta Vase',
    description: 'Earthy handmade terracotta clay vase crafted by local artisans.',
    price: 45,
    category: 'Home Decor',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=500',
  },
  {
    name: 'Handwoven Cotton Throw Blanket',
    description: '100% organic cotton handwoven on traditional wooden looms.',
    price: 65,
    category: 'Textiles',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
  },
  {
    name: 'Handcarved Wooden Bowl',
    description: 'Sustainably sourced teak wood bowl polished with natural beeswax.',
    price: 32.5,
    category: 'Kitchenware',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500',
  },

  // New pottery products
  {
    name: 'Handmade Ceramic Coffee Mug',
    description: 'A rustic ceramic mug shaped and glazed by hand, perfect for everyday coffee.',
    price: 28,
    category: 'Pottery',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
  },
  {
    name: 'Blue Patterned Pottery Bowl',
    description: 'A decorative handmade pottery bowl featuring a timeless blue pattern.',
    price: 38,
    category: 'Pottery',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500',
  },
  {
    name: 'Handmade Ceramic Wall Hanging',
    description: 'An artisan ceramic accent designed to add character to your wall.',
    price: 34,
    category: 'Pottery',
    stock: 7,
    image: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=500',
  },

  // New textile products
  {
    name: 'Embroidered Cushion Cover',
    description: 'A textile cushion cover featuring artisan embroidery and a soft woven finish.',
    price: 35,
    category: 'Textiles',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
  },
  {
    name: 'Handwoven Table Runner',
    description: 'A textured table runner woven by hand for an artisan-inspired dining space.',
    price: 30,
    category: 'Textiles',
    stock: 11,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500',
  },

  // New woodwork products
  {
    name: 'Carved Wooden Serving Tray',
    description: 'A handcrafted wooden tray with a natural finish for serving or display.',
    price: 42,
    category: 'Woodwork',
    stock: 9,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500',
  },
  {
    name: 'Wooden Desk Organizer',
    description: 'A practical wooden organizer for pens, stationery, and small accessories.',
    price: 26,
    category: 'Woodwork',
    stock: 13,
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500',
  },

  // New jewelry products
  {
    name: 'Handmade Beaded Earrings',
    description: 'Lightweight artisan earrings with colorful beads and a distinctive design.',
    price: 18,
    category: 'Jewelry',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
  },
  {
    name: 'Minimalist Pendant Necklace',
    description: 'A delicate pendant necklace designed for everyday wear.',
    price: 32,
    category: 'Jewelry',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
  },
  {
    name: 'Artisan Brass Bracelet',
    description: 'A simple artisan bracelet with a warm metallic finish and timeless style.',
    price: 29,
    category: 'Jewelry',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500',
  },

  // New home decor products
  {
    name: 'Handwoven Jute Basket',
    description: 'A versatile woven basket for organizing small household essentials.',
    price: 24,
    category: 'Home Decor',
    stock: 16,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
  },
  {
    name: 'Decorative Terracotta Planter',
    description: 'A rustic terracotta planter that adds a natural touch to indoor spaces.',
    price: 22,
    category: 'Home Decor',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
  },
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    let addedCount = 0;
    let skippedCount = 0;

    for (const product of sampleProducts) {
      const existingProduct = await Product.findOne({
        name: product.name,
      });

      if (existingProduct) {
        skippedCount++;
        console.log(`Skipped existing product: ${product.name}`);
        continue;
      }

      await Product.create(product);
      addedCount++;
      console.log(`Added: ${product.name}`);
    }

    const totalProducts = await Product.countDocuments();

    console.log('\nProduct seeding completed!');
    console.log(`Added: ${addedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Total products in database: ${totalProducts}`);
  } catch (error) {
    console.error('Product seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDB();
