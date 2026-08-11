const crypto = require("crypto");

const safeJson = (value, fallback = []) => {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  if (!value || value === "null") return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};

const cleanText = (value, max = 5000) => String(value || "")
  .replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
  .replace(/\s+/g, " ").trim().slice(0, max);

const number = (value, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const truthy = (value) => /^(true|yes|1|in stock)$/i.test(String(value || "").trim());
const unique = (values) => [...new Set(values.filter(Boolean).map((value) => cleanText(value, 120)))];
const sourceKey = (provider, sourceId) => crypto.createHash("sha256").update(`${provider}:${sourceId}`).digest("hex").slice(0, 20);

module.exports = { safeJson, cleanText, number, truthy, unique, sourceKey };
