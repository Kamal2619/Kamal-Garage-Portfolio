/* ═══════════════════════════════════════════
   Minimal Creates — Ascension Paradigm (v2)
   5 Floors, Elevator Logic, CMS stub
   ═══════════════════════════════════════════ */

import { fetchSanityData, urlFor, portableTextToHtml } from './sanity-client.js';

/* ─── DOM refs (populated in init) ─── */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
let els = {};

/* ─── State ─── */
const FLOOR_ORDER = ["B", "1", "2", "3", "R"];
let currentFloorIdx = 0;
let isTransitioning = true; // start true for startup sequence
let hasScrolled = false;
let scrollAccumulator = 0;
let lastTopbarScrollTop = 0;
const SCROLL_THRESHOLD = 250; // pixels of overshoot required to trigger transition
let audioCtx = null;

/* ─── Init ─── */
function init() {
  // Populate DOM refs now that DOM is ready
  els = {
    body:           document.body,
    scene3d:        $("#scene-3d"),
    floors:         $("#floors"),
    sections:       Array.from($$(".floor-section")),
    indicator:      $("#indicator-value"),
    arrowUp:        $("#arrow-up"),
    arrowDown:      $("#arrow-down"),
    panelBtns:      $$(".panel-btn"),
    kicker:         $("#scene-kicker"),
    title:          $("#scene-title"),
    scrollHint:     $("#scroll-hint"),
    edgeHint:       $("#scroll-edge-hint"),
    contactForm:    $("#contact-form"),
    cursor:         $("#cursor-elevator"),
    marqueeTrack:   $(".marquee-track")
  };

  // 1. Startup Sequence
  els.body.dataset.state = "startup";
  els.body.dataset.floor = FLOOR_ORDER[0];
  
  const startSection = document.getElementById(`floor-${FLOOR_ORDER[0]}`);
  if (startSection) startSection.classList.add("active");
  
  // Load CMS content asynchronously
  loadSanityContent();
  
  setTimeout(() => {
    els.body.dataset.state = "ready";
    els.body.classList.add("doors-open");
    isTransitioning = false;
    animateVisibleElements(FLOOR_ORDER[0]);
  }, 3000);

  setupAscensionController();
  setupPanelButtons();
  setupContactForm();
  setupCursorAnd3DTracking();
  setupKeyboard();
  setupIntersectionObservers();
  setupMarquee();
  setupFloatHeaders();
  setupAudioUnlock();
}

/* ─── Floating Headers & Smart Topbar scroll ─── */
function setupFloatHeaders() {
  const sections = document.querySelectorAll(".floor-section");
  const topbar = document.querySelector(".topbar");
  
  sections.forEach(section => {
    section.addEventListener("scroll", () => {
      const scrollY = section.scrollTop;
      
      // Auto-hide/show topbar logic
      if (topbar) {
        if (scrollY > lastTopbarScrollTop && scrollY > 50) {
          topbar.classList.add("header-hidden");
        } else if (scrollY < lastTopbarScrollTop) {
          topbar.classList.remove("header-hidden");
        }
        
        // Scrolled background style
        if (scrollY > 15) {
          topbar.classList.add("topbar-scrolled");
        } else {
          topbar.classList.remove("topbar-scrolled");
        }
      }
      lastTopbarScrollTop = scrollY;

      // Parallax on section floor-header (if it exists)
      const header = section.querySelector(".floor-header");
      if (header) {
        const fadeStart = 30;
        const fadeEnd = 250;
        const translateY = -(scrollY * 0.5);
        const scale = Math.max(0.9, 1 - scrollY * 0.0003);
        const opacity = scrollY < fadeStart ? 1 : Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
        
        header.style.transform = `translateY(${translateY}px) scale(${scale})`;
        header.style.opacity = opacity;
      }
    }, { passive: true });
  });
}

/* ─── Ascension Controller (Gradual Scroll) ─── */
function setupAscensionController() {
  let touchStartX = 0;
  let touchStartY = 0;
  let lastScrollTime = 0;

  const triggerScroll = (direction) => {
    if (isTransitioning) return;
    
    // Hide initial scroll hint
    if (!hasScrolled) {
      hasScrolled = true;
      if (els.scrollHint) els.scrollHint.classList.add("hidden");
    }

    const nextIdx = currentFloorIdx + direction;
    if (nextIdx >= 0 && nextIdx < FLOOR_ORDER.length) {
      if (els.edgeHint) els.edgeHint.classList.remove("visible");
      scrollAccumulator = 0;
      transitionToFloor(FLOOR_ORDER[nextIdx]);
    }
  };

  const handleScrollInput = (deltaY) => {
    if (isTransitioning || deltaY === 0) return;
    
    const now = Date.now();
    if (now - lastScrollTime > 1000) {
      // Reset accumulator if user stopped scrolling for a bit
      scrollAccumulator = 0;
    }
    lastScrollTime = now;

    const currentSection = document.getElementById(`floor-${FLOOR_ORDER[currentFloorIdx]}`);
    if (!currentSection) return;

    // Check if user is at boundary of scrollable section
    const atTop = currentSection.scrollTop <= 5;
    const atBottom = currentSection.scrollTop + currentSection.clientHeight >= currentSection.scrollHeight - 5;

    // We go "up" the floors (B -> R) when user scrolls DOWN (deltaY > 0) at the bottom
    if (deltaY > 0 && atBottom) {
      if (currentFloorIdx < FLOOR_ORDER.length - 1) {
        scrollAccumulator += deltaY;
        if (els.edgeHint) els.edgeHint.classList.add("visible");
        if (scrollAccumulator > SCROLL_THRESHOLD) {
          triggerScroll(1);
        }
      }
    } 
    // We go "down" the floors (R -> B) when user scrolls UP (deltaY < 0) at the top
    else if (deltaY < 0 && atTop) {
      if (currentFloorIdx > 0) {
        scrollAccumulator += Math.abs(deltaY);
        if (els.edgeHint) els.edgeHint.classList.add("visible");
        if (scrollAccumulator > SCROLL_THRESHOLD) {
          triggerScroll(-1);
        }
      }
    } 
    // User is scrolling within the content bounds
    else {
      scrollAccumulator = 0;
      if (els.edgeHint) els.edgeHint.classList.remove("visible");
    }
  };

  window.addEventListener("wheel", (e) => {
    handleScrollInput(e.deltaY);
  }, { passive: true });

  window.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", e => {
    if (isTransitioning) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Check if vertical swipe is prominent and exceeds threshold
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
      const currentSection = document.getElementById(`floor-${FLOOR_ORDER[currentFloorIdx]}`);
      if (!currentSection) return;
      
      const atTop = currentSection.scrollTop <= 8;
      const atBottom = currentSection.scrollTop + currentSection.clientHeight >= currentSection.scrollHeight - 8;
      
      if (diffY > 0 && atBottom) {
        // Swipe up -> scroll down -> ascend floor
        const nextIdx = currentFloorIdx + 1;
        if (nextIdx < FLOOR_ORDER.length) transitionToFloor(FLOOR_ORDER[nextIdx]);
      } else if (diffY < 0 && atTop) {
        // Swipe down -> scroll up -> descend floor
        const prevIdx = currentFloorIdx - 1;
        if (prevIdx >= 0) transitionToFloor(FLOOR_ORDER[prevIdx]);
      }
    }
  }, { passive: true });
}

/* ─── Elevator Door Transition ─── */
function transitionToFloor(floorId) {
  if (isTransitioning || floorId === FLOOR_ORDER[currentFloorIdx]) return;
  isTransitioning = true;
  els.body.dataset.state = "transitioning";

  const targetIdx = FLOOR_ORDER.indexOf(floorId);
  const isAscending = targetIdx > currentFloorIdx; // B -> R is ascending visually

  // 1. Close doors & keep elevator background static (no zoom in/out)
  els.scene3d.style.transform = 'translateZ(0)';
  els.body.classList.remove("doors-open");
  
  // 2. Mid-close: swap content
  setTimeout(() => {
    updateIndicator(floorId, isAscending);
    
    // Deactivate old, activate new
    const oldSection = document.getElementById(`floor-${FLOOR_ORDER[currentFloorIdx]}`);
    if (oldSection) oldSection.classList.remove("active");
    
    currentFloorIdx = targetIdx;
    
    const newSection = document.getElementById(`floor-${FLOOR_ORDER[currentFloorIdx]}`);
    if (newSection) {
      newSection.classList.add("active");
      // Reset scroll position
      newSection.scrollTop = isAscending ? 0 : newSection.scrollHeight;
      // Reset floating header so it appears fresh
      const header = newSection.querySelector(".floor-header");
      if (header) {
        header.style.transform = "translateY(0) scale(1)";
        header.style.opacity = "1";
      }
      // Reset topbar state for new floor
      const topbar = document.querySelector(".topbar");
      if (topbar) {
        topbar.classList.remove("header-hidden");
        if (newSection.scrollTop > 15) {
          topbar.classList.add("topbar-scrolled");
        } else {
          topbar.classList.remove("topbar-scrolled");
        }
      }
      lastTopbarScrollTop = newSection.scrollTop;
    }
    
    els.body.dataset.floor = floorId;
    updateTopbar(floorId);
    updatePanelButtons(floorId);
    
  }, 600); // Wait for doors to close

  // 3. Ding & Open doors
  setTimeout(() => {
    playDingSound();
    
    els.scene3d.style.transform = ''; // reset 3D transform
    els.body.classList.add("doors-open");
    els.body.dataset.state = "ready";
    
    // 4. Content entry animation
    setTimeout(() => {
      animateVisibleElements(floorId, !isAscending);
      isTransitioning = false;
    }, 400); // Time after doors start opening to show content
    
  }, 1000); // 400ms after swap
}

/* ─── Cinematic Ding Sound ─── */
function playDingSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    gain1.gain.setValueAtTime(0, audioCtx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, audioCtx.currentTime); // E6
    gain2.gain.setValueAtTime(0, audioCtx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1760, audioCtx.currentTime); // A6 (harmonic)
    gain3.gain.setValueAtTime(0, audioCtx.currentTime);
    gain3.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
    gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    
    osc1.start(); osc2.start(); osc3.start();
    osc1.stop(audioCtx.currentTime + 2);
    osc2.stop(audioCtx.currentTime + 2);
    osc3.stop(audioCtx.currentTime + 2);
  } catch(e) {
    console.log("AudioContext blocked or failed.", e);
  }
}

/* ─── Web Audio Autoplay Unlock ─── */
function setupAudioUnlock() {
  const unlock = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().then(() => {
          console.log("AudioContext resumed successfully.");
          playSilentBuffer();
          removeListeners();
        }).catch(err => {
          console.warn("AudioContext resume failed:", err);
        });
      } else if (audioCtx && audioCtx.state === "running") {
        playSilentBuffer();
        removeListeners();
      }
    } catch (e) {
      console.warn("AudioContext initialization failed inside gesture handler:", e);
    }
  };

  const playSilentBuffer = () => {
    try {
      if (audioCtx) {
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }
    } catch (e) {
      console.warn("Error playing silent buffer:", e);
    }
  };

  const removeListeners = () => {
    const events = ["click", "touchstart", "touchend", "mousedown", "keydown", "wheel"];
    events.forEach(evt => {
      window.removeEventListener(evt, unlock, { passive: true });
      window.removeEventListener(evt, unlock, false);
    });
  };

  const events = ["click", "touchstart", "touchend", "mousedown", "keydown", "wheel"];
  events.forEach(evt => {
    const usePassive = evt === "wheel" || evt === "touchstart" || evt === "touchend";
    window.addEventListener(evt, unlock, usePassive ? { passive: true } : false);
  });
}

/* ─── Indicator ─── */
function updateIndicator(floorId, goingUp) {
  els.indicator.textContent = floorId;
  els.arrowUp.classList.toggle("active", goingUp);
  els.arrowDown.classList.toggle("active", !goingUp);
  setTimeout(() => {
    els.arrowUp.classList.remove("active");
    els.arrowDown.classList.remove("active");
  }, 1200);
}

/* ─── Top bar ─── */
function updateTopbar(floorId) {
  const section = $(`#floor-${floorId}`);
  if (!section) return;
  if (els.kicker) els.kicker.textContent = section.dataset.kicker || "";
  if (els.title) els.title.textContent = section.dataset.title || "";
}

/* ─── Panel buttons ─── */
function setupPanelButtons() {
  els.panelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      transitionToFloor(btn.dataset.floor);
    });
  });
}

function updatePanelButtons(floorId) {
  els.panelBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.floor === floorId);
  });
}

/* ─── Intersection Observers for Scroll Animations ─── */
function setupIntersectionObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  $$("[data-animate]").forEach(el => observer.observe(el));
}

function animateVisibleElements(floorId, isDescending) {
  // Immediately trigger visibility for elements currently in viewport on new floor
  const section = $(`#floor-${floorId}`);
  if (!section) return;
  
  const items = section.querySelectorAll("[data-animate]");
  items.forEach((el, i) => {
    // Only animate if it's near the top (in view). Let intersection observer handle the rest.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(() => {
        el.classList.add("visible");
      }, i * 150); // Stagger
    }
  });
}

/* ─── Web3Forms Contact Form & Carousel ─── */
function setupContactForm() {
  if(!els.contactForm) return;

  const steps = Array.from(els.contactForm.querySelectorAll('.form-step'));
  const dots = Array.from(els.contactForm.querySelectorAll('.dot'));
  const nextBtns = Array.from(els.contactForm.querySelectorAll('.next-btn'));
  const prevBtns = Array.from(els.contactForm.querySelectorAll('.prev-btn'));
  let currentStep = 0;

  function showStep(stepIndex) {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === stepIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === stepIndex);
    });
  }

  nextBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const input = steps[currentStep].querySelector('input, textarea');
      if (!btn.classList.contains('skip-btn') && input && !input.checkValidity()) {
        input.reportValidity();
        return;
      }
      currentStep++;
      if (currentStep >= steps.length) currentStep = steps.length - 1;
      showStep(currentStep);
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep--;
      if (currentStep < 0) currentStep = 0;
      showStep(currentStep);
    });
  });
  
  els.contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector(".send-button");
    const resultDiv = $("#form-result");
    
    btn.textContent = "Sending...";
    btn.disabled = true;
    
    const accessKeyInput = form.querySelector('input[name="access_key"]');
    const accessKey = accessKeyInput ? accessKeyInput.value : "";
    
    // Bypass Web3Forms call if the key is the default template placeholder
    if (accessKey === "YOUR_WEB3FORMS_ACCESS_KEY_HERE" || !accessKey) {
      setTimeout(() => {
        resultDiv.innerHTML = "Signal sent. We'll be in touch.";
        resultDiv.classList.add("success");
        form.reset();
        currentStep = 0;
        showStep(0);
        btn.textContent = "Send It →";
        btn.disabled = false;
        setTimeout(() => {
          resultDiv.innerHTML = "";
          resultDiv.classList.remove("success", "error");
        }, 5000);
      }, 1000);
      return;
    }
    
    const formData = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const json = await response.json();
      
      if (response.status == 200) {
        resultDiv.innerHTML = "Signal sent. We'll be in touch.";
        resultDiv.classList.add("success");
        form.reset();
        currentStep = 0;
        showStep(0);
      } else {
        resultDiv.innerHTML = json.message || "Transmission failed. Try again.";
        resultDiv.classList.add("error");
      }
    } catch (error) {
      resultDiv.innerHTML = "System error. Please try again later.";
      resultDiv.classList.add("error");
    } finally {
      btn.textContent = "Send It →";
      btn.disabled = false;
      setTimeout(() => {
        resultDiv.innerHTML = "";
        resultDiv.classList.remove("success", "error");
      }, 5000);
    }
  });
}

/* ─── 3D Tracking & Cursor ─── */
function setupCursorAnd3DTracking() {
  const isFinePointer = matchMedia("(pointer: fine)").matches;
  
  if (isFinePointer) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    
    document.addEventListener("mousemove", (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      
      // Request animation frame for smooth cursor
      requestAnimationFrame(() => {
        els.body.style.setProperty("--cx", `${cursorX - 20}px`);
        els.body.style.setProperty("--cy", `${cursorY - 20}px`);

        // Global 3D Tilt (max 8 degrees tilt for deeper effect)
        if (!isTransitioning) {
          const xFactor = (cursorX / window.innerWidth) - 0.5;
          const yFactor = (cursorY / window.innerHeight) - 0.5;
          els.scene3d.style.setProperty("--tilt-y", `${xFactor * 8}deg`);
          els.scene3d.style.setProperty("--tilt-x", `${-yFactor * 8}deg`);
        }
      });
    });

    // Local 3D Tilt for toolboxes
    const toolboxes = document.querySelectorAll(".toolbox-container");
    toolboxes.forEach(box => {
      box.addEventListener("mousemove", (e) => {
        const rect = box.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const angleX = (yc - y) / yc * 10;
        const angleY = (x - xc) / xc * 10;
        box.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      });
      box.addEventListener("mouseleave", () => {
        box.style.transform = "";
      });
    });

    // Local 3D Tilt & Lift for category cards
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const angleX = (yc - y) / yc * 8;
        const angleY = (x - xc) / xc * 8;
        card.style.transition = "transform 0.1s ease-out";
        card.style.transform = `translateY(-12px) scale(1.025) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      });
      
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        card.style.transform = "";
      });
    });

    const hoverables = "button, a, .category-card, input, textarea, .toolbox-container, .case-card";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) els.body.classList.add("is-hovering");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) els.body.classList.remove("is-hovering");
    });
  }

  // Mobile / Tablet tap interactions for toolboxes (pointer: coarse or touch capability)
  const toolboxes = document.querySelectorAll(".toolbox-container");
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || matchMedia("(pointer: coarse)").matches;
  
  if (isTouchDevice) {
    toolboxes.forEach(box => {
      box.addEventListener("click", (e) => {
        const isActive = box.classList.contains("active");
        toolboxes.forEach(b => b.classList.remove("active"));
        if (!isActive) {
          box.classList.add("active");
        }
        e.stopPropagation();
      });
    });

    document.addEventListener("click", () => {
      toolboxes.forEach(b => b.classList.remove("active"));
    });
  }

  // Mobile Gyroscope 3D Tracking
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (e) => {
      if (isTransitioning) return;
      const beta = Math.max(-45, Math.min(45, e.beta || 0)); 
      const gamma = Math.max(-45, Math.min(45, e.gamma || 0)); 
      
      const tiltX = (beta / 45) * 8; // Scale gyroscope tilt up to 8 degrees
      const tiltY = (gamma / 45) * 8;
      
      els.scene3d.style.setProperty("--tilt-x", `${-tiltX}deg`);
      els.scene3d.style.setProperty("--tilt-y", `${tiltY}deg`);
    }, true);
  }
}

/* ─── Marquee Cinematic Speed ─── */
function setupMarquee() {
  if (!els.marqueeTrack) return;
  const container = $(".marquee-container");
  if (!container) return;
  
  let marqueeAngle = 0;
  let marqueeSpeed = -0.15; // Initial rotation speed (degrees per frame)
  let targetMarqueeSpeed = -0.15;
  let isTabActive = true;
  
  container.addEventListener("mouseenter", () => {
    targetMarqueeSpeed = -0.02; // Slow down but keep a subtle rotation
  });
  
  container.addEventListener("mouseleave", () => {
    targetMarqueeSpeed = -0.15; // Smoothly speed back up
  });

  // Track if tab is active to pause loop calculations when backgrounded
  document.addEventListener("visibilitychange", () => {
    isTabActive = (document.visibilityState === "visible");
  });
  
  function updateMarquee() {
    if (isTabActive && els.marqueeTrack) {
      // Lerp speed transition
      marqueeSpeed = marqueeSpeed * 0.08 + targetMarqueeSpeed * 0.92;
      marqueeAngle += marqueeSpeed;
      if (marqueeAngle <= -360) marqueeAngle += 360;
      els.marqueeTrack.style.transform = `rotateY(${marqueeAngle}deg)`;
    }
    requestAnimationFrame(updateMarquee);
  }
  
  requestAnimationFrame(updateMarquee);
}

/* ─── Keyboard ─── */
function setupKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = currentFloorIdx + 1; // B -> 1
      if (nextIdx < FLOOR_ORDER.length) transitionToFloor(FLOOR_ORDER[nextIdx]);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = currentFloorIdx - 1; // 1 -> B
      if (prevIdx >= 0) transitionToFloor(FLOOR_ORDER[prevIdx]);
    }
  });
}

/* ─── Sanity CMS Dynamic Content Loader ─── */
async function loadSanityContent() {
  try {
    const data = await fetchSanityData();
    if (!data) return;

    // 1. Populate Marquee Logos (Floor 3)
    if (data.logos && data.logos.length > 0 && els.marqueeTrack) {
      els.marqueeTrack.innerHTML = "";
      data.logos.forEach(logoDoc => {
        const item = document.createElement("div");
        item.className = "marquee-item";
        const logoUrl = urlFor(logoDoc.logo);
        const slug = logoDoc.slug?.current || '#';
        item.innerHTML = `<a href="/works/work-detail.html?slug=${slug}"><img src="${logoUrl}" alt="${logoDoc.name || 'Brand Logo'}" /></a>`;
        els.marqueeTrack.appendChild(item);
      });
      // Recalculate 3D positioning circle
      const items = els.marqueeTrack.querySelectorAll(".marquee-item");
      items.forEach((item, index) => {
        const angle = (index * 360) / items.length;
        item.style.transform = `rotateY(${angle}deg) translateZ(clamp(300px, 35vw, 600px))`;
      });
    }

    // 2. Populate Testimonials (Floor 3)
    const feedbackGrid = $(".feedback-grid");
    if (feedbackGrid && data.testimonials && data.testimonials.length > 0) {
      feedbackGrid.innerHTML = "";
      data.testimonials.forEach(tDoc => {
        const stars = "★".repeat(tDoc.rating || 5);
        const card = document.createElement("a");
        card.href = tDoc.slug ? `/works/work-detail.html?slug=${tDoc.slug.current}` : '#';
        card.className = "feedback-card";
        card.style.textDecoration = "none";
        card.style.color = "inherit";
        card.dataset.animate = "";
        
        let quoteHtml = portableTextToHtml(tDoc.quote);
        // If it starts with <p>, we remove the outer <p> so we can wrap it in our own stylized quote marks if needed, 
        // or just render it directly. We'll render it directly inside a div instead of a <p> tag.
        
        card.innerHTML = `
          <div class="stars">${stars}</div>
          <div class="quote-content" style="font-size: 1.1rem; line-height: 1.6; margin: 1rem 0;">${quoteHtml}</div>
          <div class="client-info">
            <strong>${tDoc.clientName}</strong>
            <span>${tDoc.role}</span>
          </div>
        `;
        feedbackGrid.appendChild(card);
      });
      // Re-observe dynamic elements for scroll animations
      setupIntersectionObservers();
    }
  } catch (err) {
    console.error("Error loading Sanity content:", err);
  }
}

/* ─── Boot ─── */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
