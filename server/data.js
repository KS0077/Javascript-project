const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const categories = [
  'snacks',
  'plant-based-foods',
  'beverages',
  'canned-foods',
  'frozen-foods',
  'fermented-foods'
];

function fetchAndSaveCategory(category) {
  const baseUrl = `https://world.openfoodfacts.org/category/${category}.json`;
  const localFilePath = path.join(__dirname, `./data/${category}-sample.json`);
  const count = 100;
  let namedProducts = [];
  let page = 1;

  function fetchPage() {
    const url = `${baseUrl}?page=${page}&page_size=100`;

    return fetch(url)
      .then(res => res.json())
      .then(apiData => {
        if (!apiData.products || apiData.products.length === 0) {
          return;
        }

        const named = apiData.products.filter(p => p.product_name_en && p.product_name_en.trim() !== "");
        namedProducts.push(...named);

        page++;

        if (namedProducts.length < count && page <= 10) {
          return fetchPage(); 
        }
      });
  }

  return fetchPage()
    .then(() => {
      const finalProducts = namedProducts.slice(0, count);
      fs.writeFileSync(localFilePath, JSON.stringify(finalProducts, null, 2), 'utf-8');
      console.log(`Saved ${category} to ./data/${category}-sample.json`);
    })
    .catch(error => {
      console.error(`Failed to fetch ${category}:`, error.message);
    });
}

function fetchAll() {
 
  categories.reduce((promise, category) => {
    return promise.then(() => fetchAndSaveCategory(category));
  }, Promise.resolve());
}

fetchAll();
