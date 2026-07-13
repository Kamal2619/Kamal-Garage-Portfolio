/**
 * SANITY CMS - FRONTEND CLIENT
 */

const PROJECT_ID = "egixwbp1"; // Updated with your project ID
const DATASET = "production";
const API_VERSION = "2024-05-01";

const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

export async function fetchSanityData() {
  const query = encodeURIComponent(`*[_type == "brandWork"]{
    title,
    slug,
    category,
    clientLogo,
    feedbackQuote,
    clientName,
    clientRole,
    rating,
    thumbnail
  }`);

  try {
    const response = await fetch(`${SANITY_URL}?query=${query}`);
    const { result } = await response.json();
    
    // Split the unified 'brandWork' into the arrays the home page expects
    return {
      projects: result, 
      logos: result.filter(r => r.clientLogo).map(r => ({ name: r.title, logo: r.clientLogo })),
      testimonials: result.filter(r => r.feedbackQuote).map(r => ({
        clientName: r.clientName || r.title,
        role: r.clientRole || '',
        quote: r.feedbackQuote,
        rating: r.rating || 5
      }))
    };
  } catch (error) {
    console.error("Failed to fetch from Sanity:", error);
    return null;
  }
}

// Fetch a single work by slug for the work-detail page
export async function fetchWorkBySlug(slug) {
  const query = encodeURIComponent(`*[_type == "brandWork" && slug.current == "${slug}"][0]`);
  try {
    const response = await fetch(`${SANITY_URL}?query=${query}`);
    const { result } = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch project by slug:", error);
    return null;
  }
}

// Fetch works by category for the category pages (e.g. designer.html)
export async function fetchWorksByCategory(category) {
  const query = encodeURIComponent(`*[_type == "brandWork" && category == "${category}"]{
    title,
    slug,
    category,
    thumbnail,
    subtitle,
    projectType
  }`);
  try {
    const response = await fetch(`${SANITY_URL}?query=${query}`);
    const { result } = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch category works:", error);
    return [];
  }
}

export function urlFor(source) {
  if (!source || !source.asset || !source.asset._ref) return '';
  const ref = source.asset._ref;
  const [, id, dimensions, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
}
