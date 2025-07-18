export function openProduct(product, modalElements) {
  const {
    productTitle,
    productImage,
    productBrand,
    productIngredients,
    productNutrients,
    productEnergy,
    productScore,
    productAdditives,
    modal,
  } = modalElements;

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
