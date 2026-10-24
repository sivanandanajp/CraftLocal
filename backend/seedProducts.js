
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./src/models/Product");

const products = [
  // HOME & DECOR (1–8)
  {
    name: "Handcrafted Ceramic Mug",
    description: "A beautifully crafted ceramic mug for your everyday coffee or tea.",
    price: 399,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 25,
    artisanLocation: { city: "Kochi", district: "Ernakulam", state: "Kerala", postalCode: "682001" },
  },
  {
    name: "Terracotta Flower Vase",
    description: "A rustic terracotta vase that brings warmth and character to your home.",
    price: 599,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 12,
    artisanLocation: { city: "Thrissur", district: "Thrissur", state: "Kerala", postalCode: "680001" },
  },
  {
    name: "Artisan Scented Candle",
    description: "A decorative candle designed to create a cosy atmosphere.",
    price: 349,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 30,
    artisanLocation: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", postalCode: "673001" },
  },
  {
    name: "Macrame Wall Hanging",
    description: "A handwoven decorative wall hanging with a natural bohemian look.",
    price: 899,
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 8,
    artisanLocation: { city: "Alappuzha", district: "Alappuzha", state: "Kerala", postalCode: "688001" },
  },
  {
    name: "Handwoven Cushion Cover",
    description: "A textured cushion cover made to add colour to sofas and chairs.",
    price: 499,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 20,
    artisanLocation: { city: "Kannur", district: "Kannur", state: "Kerala", postalCode: "670001" },
  },
  {
    name: "Cotton Table Runner",
    description: "A versatile fabric table runner for everyday meals and special occasions.",
    price: 449,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 15,
    artisanLocation: { city: "Palakkad", district: "Palakkad", state: "Kerala", postalCode: "678001" },
  },
  {
    name: "Decorative Wooden Tray",
    description: "A handcrafted wooden tray for serving snacks or displaying small objects.",
    price: 699,
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 10,
    artisanLocation: { city: "Kottayam", district: "Kottayam", state: "Kerala", postalCode: "686001" },
  },
  {
    name: "Hand-Painted Planter",
    description: "A colourful planter for small indoor plants and succulents.",
    price: 299,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    category: "Home & Decor",
    stock: 18,
    artisanLocation: { city: "Kollam", district: "Kollam", state: "Kerala", postalCode: "691001" },
  },

  // JEWELRY & ACCESSORIES (9–16)
  {
    name: "Polymer Clay Earrings",
    description: "Lightweight statement earrings with a contemporary handmade design.",
    price: 349,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 22,
    artisanLocation: { city: "Kochi", district: "Ernakulam", state: "Kerala", postalCode: "682001" },
  },
  {
    name: "Beaded Statement Necklace",
    description: "A colourful beaded necklace that adds personality to everyday outfits.",
    price: 599,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 14,
    artisanLocation: { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", postalCode: "695001" },
  },
  {
    name: "Minimal Silver Ring",
    description: "A simple silver-tone ring with a timeless minimalist silhouette.",
    price: 799,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 10,
    artisanLocation: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", postalCode: "673001" },
  },
  {
    name: "Handmade Beaded Bracelet",
    description: "A delicate bracelet made with decorative beads and an adjustable fit.",
    price: 249,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 28,
    artisanLocation: { city: "Thrissur", district: "Thrissur", state: "Kerala", postalCode: "680001" },
  },
  {
    name: "Everyday Cotton Tote Bag",
    description: "A reusable tote bag for shopping, books, and everyday essentials.",
    price: 399,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 25,
    artisanLocation: { city: "Alappuzha", district: "Alappuzha", state: "Kerala", postalCode: "688001" },
  },
  {
    name: "Handwoven Cotton Scarf",
    description: "A soft, versatile scarf with a relaxed woven texture.",
    price: 699,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 12,
    artisanLocation: { city: "Kannur", district: "Kannur", state: "Kerala", postalCode: "670001" },
  },
  {
    name: "Artisan Wallet",
    description: "A compact everyday wallet with practical compartments for essentials.",
    price: 899,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 9,
    artisanLocation: { city: "Kottayam", district: "Kottayam", state: "Kerala", postalCode: "686001" },
  },
  {
    name: "Floral Hair Clip Set",
    description: "A set of decorative hair clips for everyday styling and gifting.",
    price: 199,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    category: "Jewelry & Accessories",
    stock: 35,
    artisanLocation: { city: "Kollam", district: "Kollam", state: "Kerala", postalCode: "691001" },
  },

  // HANDMADE & LIFESTYLE (17–24)
  {
    name: "Handmade Soap Gift Set",
    description: "A decorative set of artisan-style soaps for gifting and daily use.",
    price: 449,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 20,
    artisanLocation: { city: "Kochi", district: "Ernakulam", state: "Kerala", postalCode: "682001" },
  },
  {
    name: "Handbound Kraft Journal",
    description: "A notebook with a natural paper finish for writing, sketching, and journaling.",
    price: 299,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 24,
    artisanLocation: { city: "Thrissur", district: "Thrissur", state: "Kerala", postalCode: "680001" },
  },
  {
    name: "Crochet Plush Bear",
    description: "A soft crochet-style bear made as a thoughtful handmade gift.",
    price: 599,
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 8,
    artisanLocation: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", postalCode: "673001" },
  },
  {
    name: "Embroidered Utility Pouch",
    description: "A compact fabric pouch for organising stationery and small essentials.",
    price: 349,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 16,
    artisanLocation: { city: "Kannur", district: "Kannur", state: "Kerala", postalCode: "670001" },
  },
  {
    name: "Pressed Flower Bookmark",
    description: "A delicate floral-inspired bookmark for readers and stationery lovers.",
    price: 149,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 40,
    artisanLocation: { city: "Alappuzha", district: "Alappuzha", state: "Kerala", postalCode: "688001" },
  },
  {
    name: "Handmade Greeting Card Set",
    description: "A set of illustrated cards for birthdays, thank-yous, and special moments.",
    price: 249,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 30,
    artisanLocation: { city: "Palakkad", district: "Palakkad", state: "Kerala", postalCode: "678001" },
  },
  {
    name: "Artisan Gift Box",
    description: "A ready-to-style gift box for assembling small handmade treasures.",
    price: 799,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 12,
    artisanLocation: { city: "Kottayam", district: "Kottayam", state: "Kerala", postalCode: "686001" },
  },
  {
    name: "Colourful Resin Coaster Set",
    description: "Decorative resin-style coasters for coffee tables and workspaces.",
    price: 499,
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=800&q=80",
    category: "Handmade & Lifestyle",
    stock: 15,
    artisanLocation: { city: "Kollam", district: "Kollam", state: "Kerala", postalCode: "691001" },
  },

  // KITCHEN & DINING (25–32)
  {
    name: "Wooden Chopping Board",
    description: "A sturdy wooden board for food preparation and serving.",
    price: 799,
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 10,
    artisanLocation: { city: "Kochi", district: "Ernakulam", state: "Kerala", postalCode: "682001" },
  },
  {
    name: "Handmade Wooden Coasters",
    description: "A set of wooden coasters designed to protect tables from drink marks.",
    price: 299,
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 22,
    artisanLocation: { city: "Thrissur", district: "Thrissur", state: "Kerala", postalCode: "680001" },
  },
  {
    name: "Ceramic Serving Bowl",
    description: "A versatile ceramic bowl for salads, snacks, and side dishes.",
    price: 549,
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 12,
    artisanLocation: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", postalCode: "673001" },
  },
  {
    name: "Handcrafted Dinner Plate",
    description: "A decorative handmade-style plate for everyday dining.",
    price: 449,
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 16,
    artisanLocation: { city: "Alappuzha", district: "Alappuzha", state: "Kerala", postalCode: "688001" },
  },
  {
    name: "Ceramic Spice Jar",
    description: "A compact ceramic jar for storing everyday spices and seasonings.",
    price: 299,
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 20,
    artisanLocation: { city: "Palakkad", district: "Palakkad", state: "Kerala", postalCode: "678001" },
  },
  {
    name: "Cotton Kitchen Towel Set",
    description: "Reusable cotton kitchen towels for wiping surfaces and drying dishes.",
    price: 349,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 18,
    artisanLocation: { city: "Kannur", district: "Kannur", state: "Kerala", postalCode: "670001" },
  },
  {
    name: "Hand-Carved Wooden Spoon",
    description: "A wooden kitchen spoon for stirring and serving food.",
    price: 199,
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 25,
    artisanLocation: { city: "Kottayam", district: "Kottayam", state: "Kerala", postalCode: "686001" },
  },
  {
    name: "Rustic Serving Tray",
    description: "A rustic serving tray for tea, snacks, or tabletop styling.",
    price: 649,
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen & Dining",
    stock: 9,
    artisanLocation: { city: "Kollam", district: "Kollam", state: "Kerala", postalCode: "691001" },
  },

  // ART & GIFTS (33–40)
  {
    name: "Miniature Landscape Painting",
    description: "A small decorative landscape painting for a desk, shelf, or gallery wall.",
    price: 999,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 5,
    artisanLocation: { city: "Kochi", district: "Ernakulam", state: "Kerala", postalCode: "682001" },
  },
  {
    name: "Botanical Art Print",
    description: "A botanical-inspired art print for a calm, nature-themed interior.",
    price: 399,
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 20,
    artisanLocation: { city: "Thrissur", district: "Thrissur", state: "Kerala", postalCode: "680001" },
  },
  {
    name: "Woven Storage Basket",
    description: "A woven basket for organising accessories, craft supplies, or household items.",
    price: 699,
    image: "https://images.unsplash.com/photo-1593085260707-5377ba37f868?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 10,
    artisanLocation: { city: "Alappuzha", district: "Alappuzha", state: "Kerala", postalCode: "688001" },
  },
  {
    name: "Macrame Plant Hanger",
    description: "A decorative macrame hanger for displaying a small indoor plant.",
    price: 449,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 14,
    artisanLocation: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", postalCode: "673001" },
  },
  {
    name: "Handmade Paper Sculpture",
    description: "A small paper art piece designed to add a creative accent to a shelf.",
    price: 549,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 7,
    artisanLocation: { city: "Kannur", district: "Kannur", state: "Kerala", postalCode: "670001" },
  },
  {
    name: "Decorative Pottery Sculpture",
    description: "A sculptural ceramic accent for shelves, desks, and side tables.",
    price: 899,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 6,
    artisanLocation: { city: "Palakkad", district: "Palakkad", state: "Kerala", postalCode: "678001" },
  },
  {
    name: "Personalised Keepsake Gift",
    description: "A thoughtful keepsake-style gift for birthdays, celebrations, and special occasions.",
    price: 599,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 12,
    artisanLocation: { city: "Kottayam", district: "Kottayam", state: "Kerala", postalCode: "686001" },
  },
  {
    name: "Beginner Craft Kit",
    description: "A starter craft kit for a relaxing creative activity at home.",
    price: 499,
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80",
    category: "Art & Gifts",
    stock: 15,
    artisanLocation: { city: "Kollam", district: "Kollam", state: "Kerala", postalCode: "691001" },
  },
];

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your backend .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    let inserted = 0;
    let updated = 0;

    for (const product of products) {
      const result = await Product.updateOne(
        { name: product.name },
        { $set: product },
        { upsert: true, runValidators: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.matchedCount > 0) {
        updated++;
      }
    }

    console.log(`Seed complete. Inserted: ${inserted}, updated: ${updated}.`);
    console.log(`Products processed: ${products.length}`);
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
