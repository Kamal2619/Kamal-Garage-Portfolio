# Complete Sanity CMS Integration Guide

This guide will show you how to configure and deploy a Sanity Studio to manage your portfolio's content (such as customer feedback/testimonials, brand client logos, and works/projects) dynamically.

---

## Step 1: Create a Sanity Studio

1. Open your terminal in a **new, empty directory** (separate from this frontend portfolio folder).
2. Run the following initialization command:
   ```bash
   npm create sanity@latest
   ```
3. Follow the CLI prompt:
   * **Project to use:** Create new project
   * **Dataset name:** `production` (default)
   * **Project template:** Choose `Clean project (no schemas)`
   * **Package manager:** Choose your preference (e.g. `npm`)

---

## Step 2: Add the Schemas

1. Inside your newly created Sanity Studio folder, locate the directory: `schemaTypes/` (or `schemas/` depending on the template version).
2. Open the file [sanity-schemas.js](file:///c:/Users/11238/OneDrive/Desktop/mc%20garage%20portfolio%20in%20process/sanity-schemas.js) in this portfolio workspace.
3. In your Sanity Studio, replace the contents of `schemaTypes/index.js` (or similar schema index file) with the following imports and definitions:
   ```javascript
   import { projectSchema, clientLogoSchema, testimonialSchema } from './path-to-copied-schemas';

   export const schemaTypes = [projectSchema, clientLogoSchema, testimonialSchema];
   ```
   *(Alternatively, copy the exact schema objects directly into your studio's schema setup)*.

---

## Step 3: Run & Deploy the Studio

1. In your studio directory, start the local dashboard:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3333` in your browser. Here you can start adding:
   * **Projects (Works):** Specify title, category (e.g. `Branding`, `Apparel`, `Other`), thumbnail, challenge details, and visual gallery.
   * **Client Logos:** Add brand logo assets for the Floor 3 marquee circle.
   * **Testimonials:** Add client quotes, star ratings, and roles.
3. When you are ready, deploy your studio live to the cloud:
   ```bash
   npm run deploy
   ```

---

## Step 4: Link Project ID to the Frontend

1. Log in to the [Sanity Manage Dashboard](https://www.sanity.io/manage).
2. Select your project and copy the **Project ID** (a short alphanumeric string, e.g., `ab12cd34`).
3. Open [src/sanity-client.js](file:///c:/Users/11238/OneDrive/Desktop/mc%20garage%20portfolio%20in%20process/src/sanity-client.js) in this portfolio project.
4. Replace the value of `PROJECT_ID` on **Line 8** with your copied ID:
   ```javascript
   const PROJECT_ID = "your_actual_project_id_here";
   ```
5. Commit and deploy your frontend to Vercel.

---

## Step 5: Configure CORS Settings (Important!)

To allow your portfolio site to fetch content from Sanity, you must authorize your domain:
1. In the [Sanity Manage Dashboard](https://www.sanity.io/manage), go to your project.
2. Navigate to **API** -> **CORS Origins**.
3. Click **Add CORS Origin**.
4. Add your Vercel URL (e.g., `https://mc-garage-portfolio.vercel.app`) and check **Allow credentials**.
5. Add `http://localhost:5173` (for local development testing).

---

### Fallback System
If `PROJECT_ID` is set to `"YOUR_PROJECT_ID_HERE"`, the site automatically falls back to your static HTML content seamlessly. Once you update the ID and add documents in Sanity, the site will transition to load your CMS data dynamically!
