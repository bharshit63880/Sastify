export const DISCOVERY_DEFAULTS = Object.freeze({
  sort: "relevance",
  page: 1,
  view: "grid",
});

const csv = (value) => (value || "").split(",").map((item) => item.trim()).filter(Boolean);
const positiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

export const parseDiscoveryParams = (searchParams) => ({
  category: csv(searchParams.get("category")),
  brand: csv(searchParams.get("brand")),
  color: csv(searchParams.get("color")),
  size: csv(searchParams.get("size")),
  minPrice: positiveNumber(searchParams.get("minPrice")),
  maxPrice: positiveNumber(searchParams.get("maxPrice")),
  rating: positiveNumber(searchParams.get("rating")),
  discount: positiveNumber(searchParams.get("discount")),
  inStock: searchParams.get("inStock") === "true",
  trending: searchParams.get("trending") === "true",
  bestseller: searchParams.get("bestseller") === "true",
  sort: searchParams.get("sort") || DISCOVERY_DEFAULTS.sort,
  page: Math.max(1, positiveNumber(searchParams.get("page")) || DISCOVERY_DEFAULTS.page),
  view: searchParams.get("view") === "list" ? "list" : DISCOVERY_DEFAULTS.view,
});

export const updateDiscoveryParams = (current, updates, { resetPage = true } = {}) => {
  const next = new URLSearchParams(current);
  Object.entries(updates).forEach(([key, value]) => {
    const isDefault =
      value === undefined || value === null || value === "" || value === false ||
      (Array.isArray(value) && !value.length) ||
      (key === "sort" && value === DISCOVERY_DEFAULTS.sort) ||
      (key === "view" && value === DISCOVERY_DEFAULTS.view) ||
      (key === "page" && Number(value) <= 1);
    if (isDefault) next.delete(key);
    else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  if (resetPage && !Object.prototype.hasOwnProperty.call(updates, "page")) next.delete("page");
  return next;
};

export const toggleArrayValue = (items, value) =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
