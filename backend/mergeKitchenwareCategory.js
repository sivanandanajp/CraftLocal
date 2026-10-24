
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./src/models/Product");

async function mergeKitchenwareCategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Product.updateMany(
      { category: "Kitchenware" },
      { $set: { category: "Kitchen & Dining" } }
    );

    console.log("Matched products:", result.matchedCount);
    console.log("Updated products:", result.modifiedCount);

    console.log("Total products:", await Product.countDocuments());

    console.log(
      "Categories:",
      await Product.distinct("category")
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

mergeKitchenwareCategory();

