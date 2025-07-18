export function getField(product, key) {
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

export function showComparison(p1, p2) {
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
