import { fetchWorkBySlug, urlFor } from './sanity-client.js';

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    document.getElementById('loading-spinner').innerHTML = '<h2>Error: No project slug provided.</h2>';
    return;
  }

  const projectData = await fetchWorkBySlug(slug);

  if (!projectData) {
    document.getElementById('loading-spinner').innerHTML = '<h2>Error: Project not found.</h2>';
    return;
  }

  // Populate data
  document.getElementById('pd-title').innerHTML = projectData.title + (projectData.subtitle ? ` <em>${projectData.subtitle}</em>` : '');
  document.getElementById('pd-tag').innerText = projectData.projectTag || 'PROJECT';
  
  document.getElementById('pd-type').innerText = projectData.projectType || 'N/A';
  document.getElementById('pd-duration').innerText = projectData.duration || 'N/A';
  document.getElementById('pd-focus').innerText = projectData.focusArea || 'N/A';
  document.getElementById('pd-deliverables').innerText = projectData.deliverables || 'N/A';

  if (projectData.challenge) {
    document.getElementById('pd-challenge').innerText = projectData.challenge;
  } else {
    document.getElementById('pd-challenge-block').style.display = 'none';
  }

  if (projectData.solution) {
    document.getElementById('pd-solution').innerText = projectData.solution;
  } else {
    document.getElementById('pd-solution-block').style.display = 'none';
  }

  if (projectData.feedbackQuote) {
    document.getElementById('pd-feedback-block').style.display = 'block';
    document.getElementById('pd-feedback-quote').innerText = projectData.feedbackQuote;
    const authorStr = [projectData.clientName, projectData.clientRole].filter(Boolean).join(', ');
    document.getElementById('pd-feedback-author').innerText = authorStr ? `— ${authorStr}` : '';
  }

  // Gallery
  const galleryEl = document.getElementById('pd-gallery');
  if (projectData.gallery && projectData.gallery.length > 0) {
    projectData.gallery.forEach(imgData => {
      const imgUrl = urlFor(imgData);
      if (imgUrl) {
        const div = document.createElement('div');
        div.className = 'visual-showcase-card';
        div.innerHTML = `<img src="${imgUrl}" alt="${projectData.title} Showcase" />`;
        galleryEl.appendChild(div);
      }
    });
  } else {
    galleryEl.innerHTML = '<div style="padding: 2rem; color: #888;">No gallery images provided.</div>';
  }

  // Hide spinner, show content
  document.getElementById('loading-spinner').style.display = 'none';
  document.getElementById('project-container').style.display = 'flex';
});
