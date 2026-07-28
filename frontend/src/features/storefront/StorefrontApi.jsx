import { publicAxios } from "../../config/axios";

const HOME_CACHE_KEY = "sastify-storefront-home-v1";
const HOME_CACHE_TTL = 2 * 60 * 1000;

const readHomeCache = () => {
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(HOME_CACHE_KEY));
    return cached && Date.now() - cached.savedAt < HOME_CACHE_TTL ? cached.data : null;
  } catch {
    return null;
  }
};

const writeHomeCache = (data) => {
  try {
    window.sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage can be unavailable in privacy modes; the network response still works.
  }
};

export const fetchStorefrontOverview = async () => {
  try {
    const res = await publicAxios.get("/storefront/overview");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchStorefrontHome = async () => {
  const cached = typeof window !== "undefined" ? readHomeCache() : null;
  if (cached) return cached;
  try {
    const res = await publicAxios.get("/storefront/home", { timeout: 6000 });
    if (typeof window !== "undefined") writeHomeCache(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
