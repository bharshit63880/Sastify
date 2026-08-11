const quotasFor = (limit) => ({ amazon: Math.round(limit * 0.45), walmart: Math.round(limit * 0.30), shein: limit - Math.round(limit * 0.45) - Math.round(limit * 0.30) });

const selectProducts = (normalized, limit) => {
  const quotas = quotasFor(limit);
  const selected = [];
  const rejected = normalized.filter((item) => item.rejected);
  const seenSource = new Set();
  const seenNames = new Set();

  for (const provider of Object.keys(quotas)) {
    const candidates = normalized.filter((item) => !item.rejected && item.provider === provider)
      .sort((a, b) => (b.product.images.length - a.product.images.length) || (b.product.ratingCount - a.product.ratingCount));
    for (const item of candidates) {
      const nameKey = item.product.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
      const sourceKey = `${item.provider}:${item.sourceId}`;
      if (seenSource.has(sourceKey) || seenNames.has(nameKey)) { rejected.push({ ...item, rejected: true, reasons: ["duplicate"] }); continue; }
      selected.push(item); seenSource.add(sourceKey); seenNames.add(nameKey);
      if (selected.filter((entry) => entry.provider === provider).length >= quotas[provider]) break;
    }
  }
  return { selected: selected.slice(0, limit), rejected, quotas };
};

module.exports = { quotasFor, selectProducts };
