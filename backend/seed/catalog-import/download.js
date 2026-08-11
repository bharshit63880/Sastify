const fs = require("fs");
const path = require("path");
const https = require("https");
const files = ["amazon-products.csv", "walmart-products.csv", "shein-products.csv"];
const destination = path.resolve(process.env.SEED_SOURCE_DIR || path.join(__dirname, "source"));
fs.mkdirSync(destination, { recursive: true });
const download = (name) => new Promise((resolve, reject) => {
  const output = fs.createWriteStream(path.join(destination, name));
  https.get(`https://raw.githubusercontent.com/luminati-io/eCommerce-dataset-samples/main/${name}`, (response) => {
    if (response.statusCode !== 200) return reject(new Error(`Download failed for ${name}: HTTP ${response.statusCode}`));
    response.pipe(output); output.on("finish", () => output.close(resolve));
  }).on("error", reject);
});
Promise.all(files.map(download)).then(() => console.log(`Downloaded ${files.length} datasets to ${destination}`)).catch((error) => { console.error(error.message); process.exitCode = 1; });
