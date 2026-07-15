/**
 * SANITY CMS - FRONTEND CLIENT
 */

const PROJECT_ID = "egixwbp1"; // Updated with your project ID
const DATASET = "production";
const API_VERSION = "2024-05-01";

const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

export async function fetchSanityData() {
  const query = encodeURIComponent(`*[_type == "brandWork"]|order(orderRank){
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
      logos: result.filter(r => r.clientLogo).map(r => ({ name: r.title, logo: r.clientLogo, slug: r.slug })),
      testimonials: result.filter(r => r.feedbackQuote).map(r => ({
        clientName: r.clientName || r.title,
        role: r.clientRole || '',
        quote: r.feedbackQuote,
        rating: r.rating || 5,
        slug: r.slug
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

export function portableTextToHtml(blocks) {
  if (!blocks) return '';
  // Handle legacy string data (if they haven't re-saved in the new Rich Text format yet)
  if (typeof blocks === 'string') {
    return `<p>${blocks.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`;
  }
  if (!Array.isArray(blocks)) return '';
  let html = '';
  let inList = false;
  let listType = '';

  blocks.forEach(block => {
    if (block._type !== 'block' || !block.children) return;
    
    let textHtml = '';
    block.children.forEach(child => {
      let text = child.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (child.marks && child.marks.length > 0) {
        if (child.marks.includes('strong')) text = '<strong>' + text + '</strong>';
        if (child.marks.includes('em')) text = '<em>' + text + '</em>';
        if (child.marks.includes('underline')) text = '<u>' + text + '</u>';
      }
      textHtml += text;
    });

    if (block.listItem) {
      const currentListType = block.listItem === 'number' ? 'ol' : 'ul';
      if (!inList) {
        html += '<' + currentListType + ' style="margin-left: 20px;">';
        inList = true;
        listType = currentListType;
      }
      html += '<li>' + textHtml + '</li>';
      return;
    } else {
      if (inList) {
        html += '</' + listType + '>';
        inList = false;
      }
    }

    const style = block.style || 'normal';
    if (style === 'h1') html += '<h1>' + textHtml + '</h1>';
    else if (style === 'h2') html += '<h2>' + textHtml + '</h2>';
    else if (style === 'h3') html += '<h3>' + textHtml + '</h3>';
    else if (style === 'h4') html += '<h4>' + textHtml + '</h4>';
    else if (style === 'blockquote') html += '<blockquote style="border-left: 4px solid #fff; padding-left: 1rem; margin: 1rem 0; font-style: italic;">' + textHtml + '</blockquote>';
    else if (style === 'leftAlign') html += '<p style="text-align: left;">' + textHtml + '</p>';
    else if (style === 'centerAlign') html += '<p style="text-align: center;">' + textHtml + '</p>';
    else if (style === 'rightAlign') html += '<p style="text-align: right;">' + textHtml + '</p>';
    else if (style === 'justifyText') html += '<p style="text-align: justify;">' + textHtml + '</p>';
    else html += '<p>' + textHtml + '</p>';
  });

  if (inList) html += '</' + listType + '>';

  return html;
}

