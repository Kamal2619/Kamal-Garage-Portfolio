
const fs = require("fs");
const path = require("path");

const files = [
  "arcticc.html",
  "onlysick.html",
  "420-clothing.html",
  "saveetha.html",
  "zensage.html"
];

const topbarRegex = /<header class="works-topbar">[\s\S]*?<\/header>/;
const cursorRegex = /<div id="cursor-cube"[\s\S]*?<\/div>/;
const mcLogoRegex = /<title>([\s\S]*?) \| Kamal's Portfolio<\/title>/;

const newTopbar = `<header class="works-topbar">
      <a href="/index.html" class="brand-link">
        <img src="/assets/logo.png" alt="Kamal J R" class="brand-mark" style="border-radius: 50%; width: 40px; height: 40px; object-fit: cover;" />
      </a>
      <div class="studio-info">
        <span class="coordinates">CHENNAI PAIYAN</span>
        <span class="studio-label">Kamal J R Portfolio</span>
      </div>
      <div class="social-info" style="display: flex; gap: 10px;">
        <span class="social-label">Social media</span>
        <a href="https://www.linkedin.com/in/kamal-jr-6a9682257" target="_blank" rel="noopener noreferrer" class="social-link">LinkedIn</a>
        <a href="https://github.com/Kamal2619" target="_blank" rel="noopener noreferrer" class="social-link">GitHub</a>
      </div>
      <a href="/works/designer.html" class="back-link">
        <span class="arrow">?</span> Back to Designer Me
      </a>
    </header>`;

const newCursor = `<div id="cursor-elevator" class="cursor-elevator" aria-hidden="true"><div class="cursor-elevator-inner"></div></div>`;

for (const file of files) {
  const filePath = path.join(__dirname, "../works", file);
  if (!fs.existsSync(filePath)) {
    console.log("Not found:", file);
    continue;
  }
  let content = fs.readFileSync(filePath, "utf-8");
  
  content = content.replace(topbarRegex, newTopbar);
  content = content.replace(cursorRegex, newCursor);
  content = content.replace(mcLogoRegex, "<title>$1 | Kamal J R</title>");
  
  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Updated", file);
}

