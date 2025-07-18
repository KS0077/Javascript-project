export async function fetchProducts(selectedApiCategory) {
  try {
    document.getElementById("loading-spinner").style.display = "block";

    const res = await fetch(
  `/api/message?category=${selectedApiCategory}`
);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to fetch:", e);
    return null;
  } finally {
    document.getElementById("loading-spinner").style.display = "none";
  }
}
