const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../client")));

const requestTime = function (req, res, next) {
  req.requestTime = new Date().toLocaleTimeString();
  next();
};
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

app.use(requestTime);

app.get("/api/message", async (req, res) => {
  const category = req.query.category || "snacks";
  const baseUrl = `https://world.openfoodfacts.org/category/${category}.json`;
  const localFilePath = path.join(__dirname, `./data/${category}-sample.json`);

  const count = 100;
  let namedProducts = [];
  let page = 1;

  try {
    while (namedProducts.length < count && page <= 10) {
      const url = `${baseUrl}?page=${page}&page_size=100`;
      const apiResponse = await withTimeout(fetch(url), 10000);
      const apiData = await apiResponse.json();

      if (!apiData.products || apiData.products.length === 0) break;

      const named = apiData.products.filter(
        (p) => p.product_name_en && p.product_name_en.trim() !== ""
      );
      namedProducts.push(...named);

      page++;
    }

    const finalProducts = namedProducts.slice(0, count);

    res.json({
      message: `Fetched ${finalProducts.length} ${category} from OpenFoodFacts at ${req.requestTime}`,
      products: finalProducts,
    });
  } catch (error) {
    console.log(`API fetch failed. Loading local backup.`);

    try {
      const raw = fs.readFileSync(localFilePath, "utf-8");
      const localData = JSON.parse(raw);

      res.json({
        message: `Loaded from local file: ${category}-sample.json at ${req.requestTime}`,
        products: localData,
      });
    } catch (fileError) {
      console.error(
        `Failed to read local file for ${category}`,
        fileError.message
      );
      res
        .status(500)
        .json({
          error: "Failed to fetch data from both API and local backup.",
        });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
