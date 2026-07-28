import { fetchProductById } from "../products/ProductApi";

export const RECENTLY_VIEWED_STORAGE_KEY = "sastify_recently_viewed_product_ids";
const MAX_RECENTLY_VIEWED = 10;

const readIds = () => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id) => typeof id === "string").slice(0, MAX_RECENTLY_VIEWED) : [];
  } catch {
    return [];
  }
};

export const rememberViewedProduct = (id) => {
  if (!id || typeof window === "undefined") return;
  const next = [String(id), ...readIds().filter((item) => item !== String(id))].slice(0, MAX_RECENTLY_VIEWED);
  window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
};

export const fetchRecentlyViewedProducts = async () => {
  const ids = readIds();
  if (!ids.length) return [];
  const results = await Promise.allSettled(ids.map((id) => fetchProductById(id)));
  return results
    .filter((result) => result.status === "fulfilled" && result.value?._id && !result.value.isDeleted)
    .map((result) => result.value);
};
