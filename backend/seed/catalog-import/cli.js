try { require("dotenv").config(); } catch { /* Dry-run works without installed backend dependencies. */ }
const path = require("path");
const { readCsv } = require("./lib/csv");
const { normalize } = require("./lib/normalize");
const { selectProducts } = require("./lib/select");
const { writeReports } = require("./lib/report");

const baseDir = __dirname;
const sourceDir = path.resolve(process.env.SEED_SOURCE_DIR || path.join(baseDir, "source"));
const limit = Math.min(250, Math.max(150, Number(process.env.SEED_LIMIT || 200)));
const dryRun = String(process.env.SEED_DRY_RUN ?? "true").toLowerCase() !== "false";
const files = { amazon: "amazon-products.csv", walmart: "walmart-products.csv", shein: "shein-products.csv" };

const run = async () => {
  const normalized = Object.entries(files).flatMap(([provider, file]) => readCsv(path.join(sourceDir, file)).map((row) => normalize(provider, row)));
  const result = selectProducts(normalized, limit);
  result.dryRun = dryRun;
  const summary = writeReports(baseDir, result);
  console.log(JSON.stringify(summary, null, 2));
  if (dryRun) { console.log("DRY RUN: no database connection and no writes performed."); return; }
  if (process.env.SEED_MODE !== "upsert") throw new Error("Only SEED_MODE=upsert is supported");
  const mongoose = require("mongoose");
  const { connectToDB } = require("../../database/db");
  const { currentCounts, backupImportedProducts, upsertCatalog } = require("./lib/database");
  await connectToDB();
  const before = await currentCounts();
  const backup = await backupImportedProducts(baseDir);
  const write = await upsertCatalog(result.selected);
  const after = await currentCounts();
  console.log(JSON.stringify({ before, backup, matched: write.matchedCount, modified: write.modifiedCount, upserted: write.upsertedCount, after }, null, 2));
  await mongoose.connection.close();
};
run().catch((error) => { console.error(error.message); process.exitCode = 1; });
