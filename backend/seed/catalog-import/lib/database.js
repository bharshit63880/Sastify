const fs = require("fs");
const path = require("path");
const Product = require("../../../models/Product");
const Category = require("../../../models/Category");
const Brand = require("../../../models/Brand");
const { slugify } = require("../../../utils/slugify");

const currentCounts = async () => ({ products: await Product.countDocuments({}), activeProducts: await Product.countDocuments({ status: "active", isDeleted: false }) });

const backupImportedProducts = async (baseDir) => {
  const docs = await Product.find({}).lean();
  const backupDir = path.join(baseDir, "backups"); fs.mkdirSync(backupDir, { recursive: true });
  const file = path.join(backupDir, `catalog-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(docs, null, 2));
  return { file, count: docs.length };
};

const upsertCatalog = async (items) => {
  const categoryCache = new Map(); const brandCache = new Map(); const operations = [];
  for (const item of items) {
    if (!categoryCache.has(item.categoryName)) categoryCache.set(item.categoryName, await Category.findOneAndUpdate({ slug: slugify(item.categoryName) }, { $setOnInsert: { name: item.categoryName, slug: slugify(item.categoryName), path: slugify(item.categoryName), isActive: true } }, { new: true, upsert: true }));
    if (!brandCache.has(item.brandName)) brandCache.set(item.brandName, await Brand.findOneAndUpdate({ slug: slugify(item.brandName) }, { $setOnInsert: { name: item.brandName, slug: slugify(item.brandName), isActive: true } }, { new: true, upsert: true }));
    const { sourceKey, ...product } = item.product;
    operations.push({ updateOne: { filter: { "source.provider": item.provider, "source.sourceId": item.sourceId }, update: { $set: { ...product, slug: `${slugify(product.name)}-${sourceKey}`, category: categoryCache.get(item.categoryName)._id, brand: brandCache.get(item.brandName)._id } }, upsert: true } });
  }
  return Product.bulkWrite(operations, { ordered: false });
};

module.exports = { currentCounts, backupImportedProducts, upsertCatalog };
