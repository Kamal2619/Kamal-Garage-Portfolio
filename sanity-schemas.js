/**
 * SANITY CMS SCHEMAS - DESIGN MECHANICS
 * 
 * Instructions:
 * 1. Run `npm create sanity@latest` in a new folder to create your studio.
 * 2. Copy these objects into your Sanity Studio's `schemaTypes/index.js`.
 * 3. Deploy your studio and grab the Project ID.
 */

export const projectSchema = {
  name: 'project',
  title: 'Project (Work)',
  type: 'document',
  fields: [
    { name: 'title', title: 'Brand / Project Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'category', title: 'Category (e.g., Branding, Apparel)', type: 'string' },
    { name: 'year', title: 'Year', type: 'string' },
    { name: 'thumbnail', title: 'Thumbnail Image', type: 'image', options: { hotspot: true } },
    { name: 'floor', title: 'Floor Assignment', type: 'string', options: { list: ['1', '2', '3', '4', '5'] } },
    { name: 'kicker', title: 'Card Kicker Text', type: 'string', description: 'Short description for the card.' },
    
    // Case Study Details for Modal
    { name: 'challenge', title: 'The Challenge', type: 'text' },
    { name: 'solution', title: 'The Fix (Solution)', type: 'text' },
    {
      name: 'gallery',
      title: 'Project Gallery',
      type: 'array',
      of: [{ type: 'image' }]
    }
  ]
}

export const clientLogoSchema = {
  name: 'clientLogo',
  title: 'Client Logo (Marquee)',
  type: 'document',
  fields: [
    { name: 'name', title: 'Brand Name', type: 'string' },
    { name: 'logo', title: 'Logo Image', type: 'image' }
  ]
}

export const testimonialSchema = {
  name: 'testimonial',
  title: 'Testimonial (Feedback)',
  type: 'document',
  fields: [
    { name: 'clientName', title: 'Client Name', type: 'string' },
    { name: 'role', title: 'Client Role / Company', type: 'string' },
    { name: 'quote', title: 'The Quote', type: 'text' },
    { name: 'rating', title: 'Star Rating', type: 'number', initialValue: 5, validation: Rule => Rule.min(1).max(5) }
  ]
}

export const schemaTypes = [projectSchema, clientLogoSchema, testimonialSchema]
