const { mapCategory } = require("./categories");
const { validateImages } = require("./images");
const { safeJson, cleanText, number, truthy, unique, sourceKey } = require("./utils");

const USD_TO_INR = 83;
const blocked = /adult|lingerie|sex|weapon|gun|tobacco|alcohol|supplement|medicine/i;
const roundInr = (value) => Math.max(99, Math.round(value / 10) * 10 - 1);
const toInr = (value, currency) => roundInr(number(value) * (String(currency).toUpperCase() === "INR" ? 1 : USD_TO_INR));
const jsonStrings = (value) => safeJson(value, []).filter((entry) => typeof entry === "string");
const jsonSpecs = (value) => safeJson(value, []).map((entry) => ({ label: cleanText(entry.name || entry.label, 80), value: cleanText(entry.value, 180) })).filter((entry) => entry.label && entry.value);

const adapters = {
  amazon: (row) => ({
    id: row.asin || row.input_asin, name: row.title, description: row.description, brand: row.brand || row.manufacturer,
    originalPrice: row.initial_price, price: row.final_price, currency: row.currency, available: /in stock/i.test(row.availability) || truthy(row.is_available),
    rating: row.rating, reviews: row.reviews_count, images: [row.image_url, ...jsonStrings(row.images)],
    categoryText: [row.root_bs_category, row.bs_category, row.categories, row.department].join(" "),
    sourceUrl: row.url, specs: jsonSpecs(row.product_details), highlights: safeJson(row.features, []), colors: [], sizes: [], sku: row.asin,
  }),
  walmart: (row) => ({
    id: row.product_id || row.sku, name: row.product_name, description: row.description, brand: row.brand,
    originalPrice: row.initial_price, price: row.final_price, currency: row.currency, available: truthy(row.available_for_delivery),
    rating: row.rating, reviews: row.review_count, images: [row.main_image, ...jsonStrings(row.image_urls)],
    categoryText: [row.root_category_name, row.category_name, row.categories].join(" "), sourceUrl: row.url,
    specs: [...jsonSpecs(row.specifications), ...jsonSpecs(row.other_attributes)], highlights: [], colors: jsonStrings(row.colors), sizes: jsonStrings(row.sizes), sku: row.sku,
  }),
  shein: (row) => ({
    id: row.product_id || row.model_number, name: row.product_name, description: row.description, brand: row.brand || "SHEIN",
    originalPrice: row.initial_price, price: row.final_price, currency: row.currency, available: truthy(row.in_stock),
    rating: row.rating, reviews: row.reviews_count, images: [row.main_image, ...jsonStrings(row.image_urls)],
    categoryText: [row.root_category, row.category, row.category_tree].join(" "), sourceUrl: row.url,
    specs: jsonSpecs(row.other_attributes), highlights: [], colors: row.color ? [row.color] : [], sizes: unique([row.size, ...jsonStrings(row.all_available_sizes)]), sku: row.model_number || row.product_id,
  }),
};

const normalize = (provider, row) => {
  const raw = adapters[provider](row);
  const name = cleanText(raw.name, 180);
  const description = cleanText(raw.description, 3000);
  const categoryName = mapCategory(raw.categoryText);
  const images = validateImages(raw.images);
  const price = toInr(raw.price, raw.currency);
  const originalPrice = Math.max(price, toInr(raw.originalPrice || raw.price, raw.currency));
  const reasons = [];
  if (!raw.id) reasons.push("missing_source_id");
  if (name.length < 8) reasons.push("invalid_name");
  if (description.length < 30) reasons.push("short_description");
  if (!categoryName) reasons.push("unmapped_category");
  if (blocked.test(`${name} ${raw.categoryText}`)) reasons.push("blocked_content");
  if (!images.length) reasons.push("missing_valid_image");
  if (!raw.available) reasons.push("unavailable");
  if (!price || price > 500000) reasons.push("invalid_price");
  if (reasons.length) return { rejected: true, reasons, provider, sourceId: raw.id, name };

  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  return {
    provider, sourceId: String(raw.id), categoryName, brandName: cleanText(raw.brand || "Marketplace", 80),
    product: {
      sku: `${provider.toUpperCase()}-${cleanText(raw.sku || raw.id, 60)}`, currency: "INR", name, title: name,
      shortDescription: description.slice(0, 180), description, price, originalPrice, discountPercent, discountPercentage: discountPercent,
      stock: 25, stockQuantity: 25, thumbnail: images[0], images, rating: Math.min(5, Math.max(0, number(raw.rating))),
      ratingAverage: Math.min(5, Math.max(0, number(raw.rating))), reviewCount: Math.max(0, Math.round(number(raw.reviews))),
      ratingCount: Math.max(0, Math.round(number(raw.reviews))), highlights: unique(raw.highlights).slice(0, 8), specs: raw.specs.slice(0, 20),
      colors: unique(raw.colors), sizes: unique(raw.sizes), status: "active", tags: unique([categoryName, provider, raw.brand]),
      sellerName: cleanText(raw.brand || "Sastify Marketplace", 80), shippingText: "Free delivery on eligible orders",
      returnPolicy: "7 day return or replacement, subject to product condition", warranty: "Manufacturer warranty where applicable",
      source: { provider, sourceId: String(raw.id), sourceUrl: raw.sourceUrl, dataset: "luminati-io/eCommerce-dataset-samples", importedAt: new Date() },
      sourceKey: sourceKey(provider, raw.id),
    },
  };
};

module.exports = { normalize, toInr };
