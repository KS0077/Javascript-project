import { openProduct } from "./product.js";
import { showComparison } from "./compare.js";
import { fetchProducts } from "./fetchData.js";

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
const crossbtn = document.getElementById("close-modal");

function categorySelection() {
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
  });
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
    div.title = product_name_en;
    div.addEventListener("click", () =>
      openProduct(product, {
        productTitle,
        productImage,
        productBrand,
        productIngredients,
        productNutrients,
        productEnergy,
        productScore,
        productAdditives,
        modal,
      })
    );

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
  const selectedApiCategory = apiCategorySelector.value;
  categorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all-categories";
  defaultOption.textContent = "All Categories";
  categorySelect.appendChild(defaultOption);

  const data = await fetchProducts(selectedApiCategory);
  if (data && data.products && data.products.length > 0) {
    allProducts = data.products;
    visibleCount = 40;
    categories.clear();
    renderProducts();
    console.log(data.message);
    console.log(data.products);
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
