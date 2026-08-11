const isImageUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /\.(jpe?g|png|webp)(?:$|\?)/i.test(url.pathname + url.search);
  } catch { return false; }
};

const validateImages = (values) => [...new Set(values)].filter(isImageUrl).slice(0, 8);
module.exports = { isImageUrl, validateImages };
