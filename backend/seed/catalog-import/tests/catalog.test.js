const test = require("node:test");
const assert = require("node:assert/strict");
const { parseCsv } = require("../lib/csv");
const { normalize, toInr } = require("../lib/normalize");
const { quotasFor, selectProducts } = require("../lib/select");

test("CSV parser handles quoted values", () => {
  const rows = parseCsv('name,description\n"Lamp, large","Line one\nLine two"\n');
  assert.equal(rows[0].name, "Lamp, large");
  assert.equal(rows[0].description, "Line one\nLine two");
});

test("INR conversion is deterministic", () => {
  assert.equal(toInr("10", "USD"), 829);
  assert.equal(toInr("499", "INR"), 499);
});

test("normalizer creates storefront compatible product", () => {
  const result = normalize("walmart", { product_id: "123", sku: "123", product_name: "Premium cotton bedsheet set for home", description: "Soft cotton bedsheet set designed for comfortable everyday home use.", brand: "Home Brand", final_price: "19.99", initial_price: "24.99", currency: "USD", available_for_delivery: "true", rating: "4.5", review_count: "20", main_image: "https://example.com/product.jpg", image_urls: "[]", root_category_name: "Home", category_name: "Bedding", categories: "[]", url: "https://example.com/p/123", specifications: "[]", other_attributes: "[]", colors: '["Blue"]', sizes: '["Queen"]' });
  assert.equal(result.rejected, undefined);
  assert.equal(result.categoryName, "Home & Kitchen");
  assert.equal(result.product.currency, "INR");
  assert.equal(result.product.ratingCount, 20);
});

test("selection quotas total the requested limit", () => {
  assert.equal(Object.values(quotasFor(200)).reduce((sum, value) => sum + value, 0), 200);
  assert.equal(selectProducts([], 200).selected.length, 0);
});
