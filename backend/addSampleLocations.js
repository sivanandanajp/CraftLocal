
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const locations = [
  {
    city: 'Kollam',
    district: 'Kollam',
    state: 'Kerala',
    postalCode: '691001',
  },
  {
    city: 'Kochi',
    district: 'Ernakulam',
    state: 'Kerala',
    postalCode: '682001',
  },
  {
    city: 'Thiruvananthapuram',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    postalCode: '695001',
  },
  {
    city: 'Kozhikode',
    district: 'Kozhikode',
    state: 'Kerala',
    postalCode: '673001',
  },
  {
    city: 'Thrissur',
    district: 'Thrissur',
    state: 'Kerala',
    postalCode: '680001',
  },
];

async function addSampleLocations() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from the environment.');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const products = await Product.find()
      .select('_id name artisanLocation')
      .sort({ _id: 1 });

    if (products.length === 0) {
      console.log('No products found. No changes made.');
      return;
    }

    const operations = products.map((product, index) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            artisanLocation: locations[index % locations.length],
          },
        },
      },
    }));

    const result = await Product.bulkWrite(operations);

    console.log(`Products found: ${products.length}`);
    console.log(`Products updated: ${result.modifiedCount}`);

    const updatedProducts = await Product.find()
      .select('name artisanLocation')
      .sort({ _id: 1 })
      .lean();

    console.log('\nUpdated product locations:');
    console.log(JSON.stringify(updatedProducts, null, 2));
  } catch (error) {
    console.error('Failed to add sample locations:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

addSampleLocations();
