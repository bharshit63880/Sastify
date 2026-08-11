require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../../models/Product");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const imported = { "source.dataset": "luminati-io/eCommerce-dataset-samples" };
  const [total, active, count, badPrice, badImage, badReferences, providers, categories] = await Promise.all([
    Product.countDocuments({}), Product.countDocuments({ status: "active", isDeleted: false }), Product.countDocuments(imported),
    Product.countDocuments({ ...imported, $or: [{ price: { $lte: 0 } }, { originalPrice: { $lt: 0 } }] }),
    Product.countDocuments({ ...imported, $or: [{ thumbnail: "" }, { images: { $size: 0 } }] }),
    Product.countDocuments({ ...imported, $or: [{ category: null }, { brand: null }] }),
    Product.aggregate([{ $match: imported }, { $group: { _id: "$source.provider", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Product.aggregate([{ $match: imported }, { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "categoryDoc" } }, { $unwind: "$categoryDoc" }, { $group: { _id: "$categoryDoc.name", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  console.log(JSON.stringify({ database: mongoose.connection.name, total, active, imported: count, badPrice, badImage, badReferences, providers, categories }, null, 2));
  await mongoose.disconnect();
};
run().catch((error) => { console.error(`${error.name}:${error.code || "validation_failed"}`); process.exitCode = 1; });
