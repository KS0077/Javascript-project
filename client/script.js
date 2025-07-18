let fetchbtn = document.getElementById("bt1");
let showMoreBtn = document.getElementById("show-more");
let categorySelect = document.getElementById("category-filter");
let searchInput = document.getElementById("search-input");

let allProducts = [];
let visibleCount = 40;
let categories = new Set([]);
let searchTerm = "";
let compareSelection = [];

const apiCategorySelector = document.getElementById("category-api-selector");
const modal = document.getElementById("product-modal");
const content = document.getElementById("modal-content");
const crossbtn = document.getElementById("close-modal");
const productTitle = document.getElementById("modal-title");
const productImage = document.getElementById("modal-image");
const productBrand = document.getElementById("modal-brand");
const productIngredients = document.getElementById("modal-ingredients");
const productNutrients = document.getElementById("modal-nutrients");
const productEnergy = document.getElementById("modal-energy");
const productScore = document.getElementById("modal-nutriscore");
const productAdditives = document.getElementById("modal-additives");
const compareModal = document.getElementById("compare-modal");
const comparisonDiv = document.getElementById("comparison-table");

function categorySelection() {
  // categorySelect.innerHTML = "";
  // const defaultOption = document.createElement("option");
  // defaultOption.value = "all-categories";
  // defaultOption.textContent = "All Categories";
  // categorySelect.appendChild(defaultOption);

  const sortedCategories = [...categories].sort();
  for (let i = sortedCategories.length - 1; i >= 0; i--) {
    if (!sortedCategories[i].startsWith("en")) {
      sortedCategories.splice(i, 1);
    }
  }

  sortedCategories.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c.replace("en:", "").replace("-", " ");
    categorySelect.appendChild(option);
    // console.log(option);
  });
}

function openProduct(product) {
  productTitle.textContent = product.product_name_en || "Unnamed Product";
  productImage.src = product.image_url || "";
  productImage.alt = product.product_name_en || "No image";
  productBrand.textContent = product.brands || "Unknown";
  productIngredients.textContent = product.ingredients_text_en || "No info";

  let nutrientString = "";
  let energyString = "";

  for (let key in product.nutriments) {
    if (key === "energy-kcal_100g") {
      energyString = `${product.nutriments[key]}`;
    }
    if (
      key.endsWith("_100g") &&
      !key.startsWith("energy") &&
      !key.startsWith("nutrition")
    ) {
      let label = key.replace("_100g", "");
      nutrientString += `${label}: ${product.nutriments[key]}, `;
    }
  }

  nutrientString = nutrientString.slice(0, -2);
  productNutrients.textContent = nutrientString || "No nutrient info available";
  productEnergy.textContent = energyString;
  productScore.textContent = product.nutriscore_grade || "Not Available";

  let additives = [];
  if (product.additives_tags) {
    additives = product.additives_tags.map((tag) => tag.replace("en:", ""));
  }

  productAdditives.textContent =
    additives.length > 0 ? additives.join(", ") : "None";
  modal.classList.remove("hidden");
}

function getField(product, key) {
  if (key.includes(".")) {
    const parts = key.split(".");
    let value = product;

    for (let part of parts) {
      if (value && value.hasOwnProperty(part)) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  } else {
    return product[key];
  }
}

function showComparison(p1, p2) {
  const compareModal = document.getElementById("compare-modal");
  const comparisonDiv = document.getElementById("comparison-table");

  const fields = [
    { label: "Name", key: "product_name_en" },
    { label: "Brand", key: "brands" },
    { label: "Energy (per 100g)", key: "nutriments.energy-kcal_100g" },
    { label: "Nutri-score Grade", key: "nutriscore_grade" },
  ];

  const grade1 = (p1.nutriscore_grade || "e").toLowerCase();
  const grade2 = (p2.nutriscore_grade || "e").toLowerCase();

  const energy1 =
    Number(getField(p1, "nutriments.energy-kcal_100g")) || Infinity;
  const energy2 =
    Number(getField(p2, "nutriments.energy-kcal_100g")) || Infinity;

  let p1IsBetter = false;
  let p2IsBetter = false;

  if (grade1 < grade2) {
    p1IsBetter = true;
  } else if (grade2 < grade1) {
    p2IsBetter = true;
  } else {
    if (energy1 < energy2) p1IsBetter = true;
    else if (energy2 < energy1) p2IsBetter = true;
  }

  const p1Class = p1IsBetter ? "healthier" : "";
  const p2Class = p2IsBetter ? "healthier" : "";

  let html = `<table border="1" cellpadding="8">
    <tr>
      <th>Field</th>
      <th>${p1.product_name_en}</th>
      <th>${p2.product_name_en}</th>
    </tr>`;

  for (let { label, key } of fields) {
    const val1 = getField(p1, key) || "N/A";
    const val2 = getField(p2, key) || "N/A";
    html += `<tr>
      <td>${label}</td>
      <td class="${p1Class}">${val1}</td>
      <td class="${p2Class}">${val2}</td>
    </tr>`;
  }

  html += `</table>`;
  comparisonDiv.innerHTML = html;
  compareModal.classList.remove("hidden");

  console.log(
    `Compairing ${p1.brands}'s ${p1.product_name_en} and ${p2.brands}'s ${p2.product_name_en}`
  );
  document.getElementById(
    "compare-head"
  ).innerHTML = `${p1.brands}'s ${p1.product_name_en} vs ${p2.brands}'s ${p2.product_name_en}`;
}

function renderProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";
  const selectedCategory = categorySelect.value;

  let filtered = allProducts.filter((p) => {
    let inCategory =
      selectedCategory === "all-categories" ||
      p.categories_tags.includes(selectedCategory);
    let matchesSearch =
      searchTerm == "" || p.product_name_en.toLowerCase().includes(searchTerm);
    return inCategory && matchesSearch;
  });
  let selected = [];
  const sliced = filtered.slice(0, visibleCount);

  sliced.forEach((product, index) => {
    const { product_name_en, image_url, categories_tags } = product;
    if (categories_tags) {
      categories = new Set([...categories, ...categories_tags]);
    }

    const div = document.createElement("div");
    div.className = "product";
    div.addEventListener("click", () => openProduct(product));

    div.innerHTML = `<h3>${index + 1}. ${
      product_name_en || "Unnamed Product"
    }</h3>${
      image_url
        ? `<img src="${image_url}" alt="${product_name_en}" width="100">`
        : "<p>No image available</p>"
    }<button class="compare-btn">Compare</button>`;

    div.querySelector(".compare-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      div.classList.add("selected");
      const selectedProduct = sliced[index];
      if (!compareSelection.some((p) => p.code === selectedProduct.code)) {
        compareSelection.push(selectedProduct);
        selected.push(div);
        // console.log(selected);
      }

      if (compareSelection.length === 2) {
        showComparison(compareSelection[0], compareSelection[1]);
        compareSelection = [];
        selected[0].classList.remove("selected");
        selected[1].classList.remove("selected");
        selected = [];
      }
    });

    container.appendChild(div);
  });

  showMoreBtn.style.display =
    visibleCount >= filtered.length ? "none" : "block";
  categorySelection();
}

document.getElementById("close-compare").addEventListener("click", () => {
  document.getElementById("compare-modal").classList.add("hidden");
});
window.addEventListener("click", (e) => {
  if (e.target === compareModal) compareModal.classList.add("hidden");
});

fetchbtn.addEventListener("click", async () => {
  try {
    const selectedApiCategory = apiCategorySelector.value;
    categorySelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "all-categories";
    defaultOption.textContent = "All Categories";
    categorySelect.appendChild(defaultOption);
    const res = await fetch(
      `http://localhost:3000/api/message?category=${selectedApiCategory}`
    );
    const data = await res.json();
    if (data.products && data.products.length > 0) {
      allProducts = data.products;
      visibleCount = 40;
      categories.clear();
      // categorySelect.innerHTML = "";
      renderProducts();
      console.log(data.message);
      console.log(data.products);
    }
  } catch (e) {
    console.error("Failed to fetch:", e);
  }
});

showMoreBtn.addEventListener("click", () => {
  visibleCount += 20;
  renderProducts();
});

categorySelect.addEventListener("change", () => {
  visibleCount = 40;
  renderProducts();
});

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value.toLowerCase();
  visibleCount = 40;
  renderProducts();
});

crossbtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
