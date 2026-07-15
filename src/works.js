/* ═══ WORKS SUB-PAGES JS ═══ */

import { fetchSanityData, renderMedia } from '/src/sanity-client.js';

// Toggle accordion items (if any are present)
export function toggleBrand(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
  document.querySelectorAll('.brand-header').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });

  if (!isExpanded) {
    button.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      button.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}

// Custom Cursor & Sanity dynamic loading
document.addEventListener("DOMContentLoaded", async () => {
  setupCursor();
  setupScrollHeader();
  await loadSanityProjects();
});

function setupScrollHeader() {
  const topbar = document.querySelector(".works-topbar");
  if (!topbar) return;

  let lastScrollTop = 0;
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    if (scrollY > lastScrollTop && scrollY > 50) {
      topbar.classList.add("header-hidden");
    } else if (scrollY < lastScrollTop) {
      topbar.classList.remove("header-hidden");
    }

    if (scrollY > 15) {
      topbar.classList.add("topbar-scrolled");
    } else {
      topbar.classList.remove("topbar-scrolled");
    }

    lastScrollTop = scrollY;
  }, { passive: true });
}

function setupCursor() {
  const isFinePointer = matchMedia("(pointer: fine)").matches;
  const cursor = document.getElementById("cursor-elevator");
  
  if (isFinePointer && cursor) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    
    document.addEventListener("mousemove", (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      
      requestAnimationFrame(() => {
        document.body.style.setProperty("--cx", `${cursorX - 20}px`);
        document.body.style.setProperty("--cy", `${cursorY - 20}px`);
      });
    });

    const hoverables = "button, a, input, textarea, .brand-header, .brand-row-layout";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) document.body.classList.add("is-hovering");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) document.body.classList.remove("is-hovering");
    });
  }
}

// Load dynamic project list from Sanity
async function loadSanityProjects() {
  const brandListSection = document.querySelector(".brand-list");
  if (!brandListSection) return;

  const data = await fetchSanityData();
  if (!data || !data.projects || data.projects.length === 0) {
    console.log("No Sanity project data. Using fallback static HTML markup.");
    return;
  }

  // Detect which category page we are on from the filename
  const pageName = window.location.pathname.split("/").pop().replace(".html", "").toLowerCase();
  let filterCategory = "";
  if (pageName.includes("branding")) filterCategory = "branding";
  else if (pageName.includes("apparel")) filterCategory = "apparel";
  else if (pageName.includes("other")) filterCategory = "other";

  if (!filterCategory) return;

  // Filter projects by category
  const filteredProjects = data.projects.filter(proj => 
    proj.category && proj.category.toLowerCase().includes(filterCategory)
  );

  if (filteredProjects.length === 0) return;

  // Clear static placeholder entries
  brandListSection.innerHTML = "";

  // Render dynamic project rows
  filteredProjects.forEach(project => {
    const card = document.createElement("a");
    card.href = "#";
    card.className = "brand-row-layout";
    
    const mediaHtml = project.thumbnail ? renderMedia(project.thumbnail, project.title + " Mockup") : `<img src="/assets/mc-logo-cube.png" alt="${project.title} Mockup" />`;

    card.innerHTML = `
      <div class="brand-info-side">
        <div class="brand-info-top">
          <span class="brand-meta-tag">${project.category || ""} / ${project.year || ""}</span>
          <h2>${project.title}</h2>
          <span class="brand-subtitle-tag">${project.kicker || ""}</span>
        </div>
        <div class="brand-info-bottom">
          <p class="brand-overview-text">${project.challenge || ""}</p>
          <span class="view-project-btn">View Project →</span>
        </div>
      </div>
      <div class="brand-mockup-side">
        ${mediaHtml}
      </div>
    `;

    // Bind click to open the immersive Case Study Modal
    card.addEventListener("click", (e) => {
      e.preventDefault();
      openProjectModal(project);
    });

    brandListSection.appendChild(card);
  });
}

function openProjectModal(project) {
  let modal = document.getElementById("project-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "project-modal";
    modal.className = "project-modal-overlay";
    document.body.appendChild(modal);
  }

  let galleryHtml = "";
  if (project.gallery && project.gallery.length > 0) {
    project.gallery.forEach(imgRef => {
      const gMediaHtml = renderMedia(imgRef, "Gallery Media");
      galleryHtml += `
        <div class="modal-gallery-card">
          ${gMediaHtml}
        </div>
      `;
    });
  }

  const thumbHtml = project.thumbnail ? renderMedia(project.thumbnail, project.title) : `<img src="/assets/mc-logo-cube.png" alt="${project.title}" />`;

  modal.innerHTML = `
    <div class="modal-wrapper">
      <button class="modal-close-btn" aria-label="Close modal">×</button>
      <div class="modal-content-grid">
        <div class="modal-details-sidebar">
          <div class="modal-header-block">
            <span class="modal-tag">${project.category || ""} — ${project.year || ""}</span>
            <h1 class="modal-title">${project.title}</h1>
          </div>
          <div class="modal-narrative">
            <h3>The Challenge</h3>
            <p>${project.challenge || "No description provided."}</p>
            <h3>The Deliverables</h3>
            <p>${project.deliverables || "N/A"}</p>
          </div>
        </div>
        
        <div class="modal-gallery-area">
          <div class="modal-hero-banner">
            ${thumbHtml}
          </div>
          <div class="modal-gallery-grid">
            ${galleryHtml}
          </div>
        </div>
      </div>
    </div>
  `;modal.classList.add("open");
  document.body.style.overflow = "hidden";

  modal.querySelector(".modal-close-btn").addEventListener("click", () => {
    closeModal(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
}

function closeModal(modal) {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
