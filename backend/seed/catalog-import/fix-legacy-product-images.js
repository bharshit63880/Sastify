require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=84`;
const categoryImages = {
  "Smartphones": image("photo-1511707171634-5f897ff02aa9"), "Feature Phones": image("photo-1598327105666-5b89351aff97"), "Power Banks": image("photo-1605236453806-6ff36851218e"),
  "Earbuds": image("photo-1590658268037-6bf12165a8df"), "Headphones": image("photo-1505740420928-5e560c06d30e"), "Bluetooth Speakers": image("photo-1608043152269-423dbba4e7e1"),
  "Smartwatches": image("photo-1523275335684-37898b6baf30"), "Fitness Bands": image("photo-1575311373937-040b8e1fd5b6"), "Laptops": image("photo-1496181133206-80ce9b88a853"),
  "Wireless Keyboards": image("photo-1587829741301-dc798b83add3"), "Wireless Mice": image("photo-1527864550417-7fd91fc51a46"), "Men T-Shirts": image("photo-1521572163474-6864f9cf17ab"),
  "Men Casual Shirts": image("photo-1602810318383-e386cc2a3ccf"), "Men Jeans": image("photo-1542272604-787c3835535d"), "Women Kurtas": image("photo-1515886657613-9f3515b0c78f"),
  "Women Dresses": image("photo-1496747611176-843222e1e57c"), "Women Tops": image("photo-1529139574466-a303027c1d8b"), "Women Jeans": image("photo-1541099649105-f69ad21f3246"),
  "Sneakers": image("photo-1542291026-7eec264c27ff"), "Running Shoes": image("photo-1600185365483-26d7a4cc7519"), "Sandals & Floaters": image("photo-1603487742131-4160ec999306"),
  "Wrist Watches": image("photo-1523170335258-f5ed11844a49"), "Backpacks": image("photo-1553062407-98eeb64c6a62"), "Cabin Luggage": image("photo-1565026057447-bc90a3dceb87"),
  "Mixer Grinders": image("photo-1570222094114-d054a817e56b"), "Induction Cooktops": image("photo-1585515320310-259814833e62"), "Air Fryers": image("photo-1556910103-1c02745aae4d"),
  "Cookware Sets": image("photo-1517705008128-361805f42e86"), "Pressure Cookers": image("photo-1504674900247-0877df9cc836"), "Bottles & Flasks": image("photo-1602143407151-7111542de6e8"),
  "Refrigerators": image("photo-1584568694244-14fbdf83bd30"), "Washing Machines": image("photo-1626806787461-102c1bfaaea1"), "Water Purifiers": image("photo-1564419320461-6870880221ad"),
  "Bedsheets": image("photo-1505693416388-ac5ce068fe85"), "Table Lamps": image("photo-1507473885765-e6ed057f782c"), "Wall Art": image("photo-1513519245088-0e12902e5a38"),
  "Face Wash": image("photo-1556228578-8c89e6adf883"), "Face Serums": image("photo-1620916566398-39f1143ab7be"), "Moisturisers": image("photo-1608248543803-ba4f8c70ae0b"),
  "Shampoo": image("photo-1535585209827-a15fcdbc4c2d"), "Hair Oil": image("photo-1608248597279-f99d160bfcbc"), "Dumbbells": image("photo-1583454110551-21f2fa2afe61"),
  "Yoga Mats": image("photo-1601925260368-ae2f83cf8b7f"), "Whey Protein": image("photo-1593095948071-474c5cc2989d"),
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000, autoIndex: false });
  const products = mongoose.connection.collection("products");
  const categories = await mongoose.connection.collection("categories").find({}, { projection: { name: 1 } }).toArray();
  const categoryNames = new Map(categories.map((category) => [String(category._id), category.name]));
  const before = await products.find({}).toArray();
  let backupFile = "existing backup retained";
  if (process.env.SKIP_IMAGE_BACKUP !== "true") {
    const backupDir = path.join(__dirname, "backups"); fs.mkdirSync(backupDir, { recursive: true });
    backupFile = path.join(backupDir, `before-legacy-image-fix-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(before, null, 2));
  }
  const legacy = before.filter((product) => !product.source?.provider);
  const operations = legacy.filter((product) => categoryImages[categoryNames.get(String(product.category))]).map((product) => {
    const nextImage = categoryImages[categoryNames.get(String(product.category))];
    const remaining = (product.images || []).filter((url) => url && url !== nextImage).slice(0, 5);
    return { updateOne: { filter: { _id: product._id }, update: { $set: { thumbnail: nextImage, images: [nextImage, ...remaining] } } } };
  });
  let modified = 0;
  for (let index = 0; index < operations.length; index += 50) {
    const result = await products.bulkWrite(operations.slice(index, index + 50), { ordered: false });
    modified += result.modifiedCount;
  }
  console.log(JSON.stringify({ database: mongoose.connection.name, backupFile, backedUp: before.length, legacyFound: legacy.length, mapped: operations.length, modified }, null, 2));
  await mongoose.disconnect();
};
run().catch((error) => { console.error(`${error.name}:${error.code || error.message}`); process.exitCode = 1; });
