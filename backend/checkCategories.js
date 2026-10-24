
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./src/models/Product");

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const kitchenware = await Product.find(
      { category: "Kitchenware" },
      { name: 1, category: 1, _id: 0 }
    ).lean();

    console.log("\nKitchenware products:");
    console.table(kitchenware);

    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("\nAll categories:");
    console.table(
      categories.map((item) => ({
        Category: item._id,
        Products: item.count,
      }))
    );

    console.log("\nTotal products:", await Product.countDocuments());
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkCategories();
