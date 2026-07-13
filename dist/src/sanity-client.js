/**
 * SANITY CMS - FRONTEND CLIENT
 * 
 * Once you deploy your Sanity Studio, fill in the PROJECT_ID below.
 * Then, import and call `fetchSanityData()` in main.js to populate the site dynamically.
 */

const PROJECT_ID = "YOUR_PROJECT_ID_HERE"; // Replace this!
const DATASET = "production";
const API_VERSION = "2024-05-01";

const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

export async function fetchSanityData() {
  if (PROJECT_ID === "YOUR_PROJECT_ID_HERE") {
    console.warn("Sanity Project ID not set. Using static fallback data.");
    return null;
  }

  const query = encodeURIComponent(`{
    "projects": *[_type == "project"] | order(year desc),
    "logos": *[_type == "clientLogo"],
    "testimonials": *[_type == "testimonial"]
  }`);

  try {
    const response = await fetch(`${SANITY_URL}?query=${query}`);
    const { result } = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch from Sanity:", error);
    return null;
  }
}

// Helper to construct image URLs from Sanity's image references
export function urlFor(source) {
  if (!source || !source.asset || !source.asset._ref) return '';
  const ref = source.asset._ref;
  // ref looks like: image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
  const [, id, dimensions, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
}
