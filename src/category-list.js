import { fetchWorksByCategory, renderMedia } from './sanity-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById('dynamic-brand-list');
  if (!container) return;

  const category = container.getAttribute('data-category');
  if (!category) {
    container.innerHTML = '<p style="color: #fff; padding: 2rem;">No category specified.</p>';
    return;
  }

  const works = await fetchWorksByCategory(category);

  if (!works || works.length === 0) {
    container.innerHTML = '<p style="color: #fff; padding: 2rem;">No projects found for this category yet. Add some in Sanity!</p>';
    return;
  }

  container.innerHTML = ''; // clear loading state

  works.forEach(work => {
    const fallbackThumb = '<div style="width: 100%; height: 100%; background: #222; display: flex; align-items: center; justify-content: center; color: #555;">No Media</div>';
    const mediaHtml = work.thumbnail ? renderMedia(work.thumbnail, work.title) : fallbackThumb;
    // ensure the rendered media fits properly in the container
    const styledMediaHtml = mediaHtml.replace('<img ', '<img style="width: 100%; height: 100%; object-fit: cover;" ').replace('<video ', '<video style="width: 100%; height: 100%; object-fit: cover;" ');

    const projectTypeStr = work.projectType ? `<span class="brand-meta-tag">${work.projectType}</span>` : '';
    const subtitleStr = work.subtitle ? `<span class="brand-subtitle-tag">${work.subtitle}</span>` : '';

    const a = document.createElement('a');
    a.href = `/works/work-detail.html?slug=${work.slug?.current}`;
    a.className = 'brand-row-layout';
    a.innerHTML = `
      <div class="brand-info-side">
        <div class="brand-info-top">
          ${projectTypeStr}
          <h2>${work.title}</h2>
          ${subtitleStr}
        </div>
        <div class="brand-info-bottom">
          <p class="brand-overview-text">Click to view the full project details, challenge, and gallery.</p>
          <span class="view-project-btn">View Project →</span>
        </div>
      </div>
      <div class="brand-mockup-side" style="display: flex; align-items: center; justify-content: center; background: #1a1a1a; overflow: hidden;">
        ${styledMediaHtml}
      </div>
    `;
    container.appendChild(a);
  });
});
