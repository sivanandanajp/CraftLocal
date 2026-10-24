
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const MONGO_URI = process.env.MONGO_URI;

const cityCoordinates = {
  Kollam: {
    latitude: 8.8932,
    longitude: 76.6141,
  },
  Kochi: {
    latitude: 9.9312,
    longitude: 76.2673,
  },
  Thiruvananthapuram: {
    latitude: 8.5241,
    longitude: 76.9366,
  },
  Kozhikode: {
    latitude: 11.2588,
    longitude: 75.7804,
  },
  Thrissur: {
    latitude: 10.5276,
    longitude: 76.2144,
  },
};

async function addSampleCoordinates() {
  try {
    if (!MONGO_URI) {
      throw new Error(
        'MONGO_URI is missing. Check your backend .env file.'
      );
    }

    await mongoose.connect(MONGO_URI);

    for (const [city, coordinates] of Object.entries(cityCoordinates)) {
      const result = await Product.updateMany(
        { 'artisanLocation.city': city },
        {
          $set: {
            'artisanLocation.latitude': coordinates.latitude,
            'artisanLocation.longitude': coordinates.longitude,
          },
        }
      );

      console.log(
        `${city}: updated ${result.modifiedCount} products`
      );
    }

    console.log('Sample coordinates added successfully.');
  } catch (error) {
    console.error('Failed to add sample coordinates:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addSampleCoordinates();
