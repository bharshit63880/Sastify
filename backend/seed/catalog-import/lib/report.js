const fs = require("fs");
const path = require("path");

const summarize = ({ selected, rejected, quotas, dryRun = true }) => ({
  generatedAt: new Date().toISOString(), dryRun, target: selected.length, quotas,
  byProvider: Object.fromEntries(["amazon", "walmart", "shein"].map((name) => [name, selected.filter((item) => item.provider === name).length])),
  byCategory: selected.reduce((counts, item) => ({ ...counts, [item.categoryName]: (counts[item.categoryName] || 0) + 1 }), {}),
  rejectedCount: rejected.length,
  rejectionReasons: rejected.flatMap((item) => item.reasons || []).reduce((counts, reason) => ({ ...counts, [reason]: (counts[reason] || 0) + 1 }), {}),
});

const writeReports = (baseDir, result) => {
  const reportDir = path.join(baseDir, "reports"); fs.mkdirSync(reportDir, { recursive: true });
  const summary = summarize(result);
  fs.writeFileSync(path.join(reportDir, "dry-run-summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(reportDir, "rejected-products.json"), JSON.stringify(result.rejected.map(({ provider, sourceId, name, reasons }) => ({ provider, sourceId, name, reasons })), null, 2));
  return summary;
};

module.exports = { summarize, writeReports };
