// API base: replace window.__API_BASE_URL__ at build-time or leave for runtime
const API_BASE_URL = window.__API_BASE_URL__ || '/api';
const CONFIG_PATH = '/projects.config.json';

// ====== Scroll Reveal Animation ======
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal');
  elements.forEach(el => {
    // Check if element is already in view
    const rect = el.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInView) {
      el.classList.add('active');
    } else {
      observer.observe(el);
    }
  });
}

// ====== Fetch Utilities ======
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return await res.json();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  initContactForm();
  loadAbout().catch(()=>{});
  loadProjects().catch(()=>{});
  loadCaseStudies().catch(()=>{});
  loadDesign().catch(()=>{});
  loadSkills().catch(()=>{});
  initThemeToggle();
  // Initialize scroll reveal after content is loaded
  setTimeout(() => initScrollReveal(), 100);
  initHeaderVisibility();
});

// ====== Header Visibility on Scroll Up or Hover ======
function initHeaderVisibility() {
  const header = document.querySelector('header');
  let lastScrollY = 0;
  let scrollTimeout;

  // Show header on hover
  header.addEventListener('mouseenter', () => {
    header.classList.remove('hidden');
    header.classList.add('visible');
  });

  header.addEventListener('mouseleave', () => {
    if (window.scrollY > 100) {
      header.classList.add('hidden');
      header.classList.remove('visible');
    }
  });

  // Show header on scroll up, hide on scroll down
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY) {
      // Scrolling up
      header.classList.remove('hidden');
      header.classList.add('visible');
    } else if (currentScrollY > 100) {
      // Scrolling down past threshold
      header.classList.add('hidden');
      header.classList.remove('visible');
    } else {
      // Near top of page
      header.classList.remove('hidden');
      header.classList.add('visible');
    }

    lastScrollY = currentScrollY;

    // Clear existing timeout
    clearTimeout(scrollTimeout);
  }, { passive: true });
}

// ====== About Section ======
async function loadAbout() {
  try {
    const about = await fetchJson(`${API_BASE_URL}/about`);
    renderAbout(about);
  } catch (err) {
    // Fallback to config file
    try {
      const config = await fetchJson(CONFIG_PATH);
      renderAbout(config.about);
    } catch (fallbackErr) {
      console.error('Failed to load about section:', fallbackErr);
    }
  }
}

function renderAbout(about) {
  const container = document.getElementById("about-container");
  container.innerHTML = `
    <h1>${about.name}</h1>
    <p class="about-title">${about.title}</p>
    <p class="about-summary">${about.summary}</p>
  `;
  
  // Ensure scroll-reveal class is set
  if (!container.classList.contains('scroll-reveal')) {
    container.classList.add('scroll-reveal');
  }
  
  // Remove any active class to reset state
  container.classList.remove('active');
  
  // Observe the element
  observer.observe(container);
}

// ====== Projects Section ======
async function loadProjects() {
  try {
    const projects = await fetchJson(`${API_BASE_URL}/projects`);
    renderProjects(projects);
  } catch (err) {
    // Fallback to config file
    try {
      const config = await fetchJson(CONFIG_PATH);
      renderProjects(config.projects);
    } catch (fallbackErr) {
      console.error('Failed to load projects:', fallbackErr);
    }
  }
}

function renderProjects(projects) {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "";
  projects.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "project-card scroll-reveal";
    card.style.setProperty('animation-delay', `${idx * 0.1}s`);
    
    let techStack = '';
    if (p.technologies && Array.isArray(p.technologies)) {
      techStack = p.technologies.map(tech => 
        `<span class="project-tech">${tech}</span>`
      ).join('');
    }

    let links = '';
    if (p.link) {
      links += `<a href="${p.link}" target="_blank" rel="noopener" class="project-link">Live Demo</a>`;
    }
    if (p.github) {
      links += `<a href="${p.github}" target="_blank" rel="noopener" class="project-link secondary">GitHub</a>`;
    }

    const img = p.image ? `<img src="${p.image}" alt="${p.title}" class="project-image" />` : '';
    
    card.innerHTML = `
      ${img}
      <div class="project-content">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-description">${p.description}</p>
        ${techStack ? `<div class="project-info">${techStack}</div>` : ''}
        <div class="project-links">
          ${links}
        </div>
      </div>
    `;
    grid.appendChild(card);
    observer.observe(card);
  });

  // Initialize carousel after cards are rendered
  setTimeout(() => initProjectsCarousel(projects.length), 100);
}

// Carousel Initialization
function initProjectsCarousel(totalProjects) {
  const grid = document.getElementById("projects-grid");
  const container = grid.parentElement;

  // Create carousel controls container if it doesn't exist
  let controlsContainer = container.querySelector('.carousel-container');
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-container';
    grid.parentElement.appendChild(controlsContainer);
  }

  // Create controls
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn';
  prevBtn.innerHTML = '❮';
  prevBtn.addEventListener('click', () => scrollProjects(-1));

  const indicators = document.createElement('div');
  indicators.className = 'carousel-indicators';

  // Calculate number of slides (3 cards per slide on desktop, 1 on mobile)
  const cardsPerSlide = window.innerWidth > 768 ? 3 : 1;
  const totalSlides = Math.ceil(totalProjects / cardsPerSlide);

  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement('div');
    indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToProjectSlide(i, cardsPerSlide));
    indicators.appendChild(indicator);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn';
  nextBtn.innerHTML = '❯';
  nextBtn.addEventListener('click', () => scrollProjects(1));

  controls.appendChild(prevBtn);
  controls.appendChild(indicators);
  controls.appendChild(nextBtn);

  // Clear and add controls
  controlsContainer.innerHTML = '';
  controlsContainer.appendChild(controls);

  // Update indicators on manual scroll
  grid.addEventListener('scroll', () => updateProjectIndicators(cardsPerSlide, totalProjects));

  // Store carousel data
  grid.dataset.cardsPerSlide = cardsPerSlide;
  grid.dataset.totalSlides = totalSlides;
  grid.dataset.totalProjects = totalProjects;
}

function scrollProjects(direction) {
  const grid = document.getElementById("projects-grid");
  const cards = grid.querySelectorAll('.project-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32; // 2rem gap in pixels
  const cardsPerSlide = parseInt(grid.dataset.cardsPerSlide);
  const slideDistance = (cardWidth + gap) * cardsPerSlide;

  grid.scrollBy({
    left: direction * slideDistance,
    behavior: 'smooth'
  });

  // Update indicators after a short delay to ensure scroll has started
  setTimeout(() => {
    updateProjectIndicators(cardsPerSlide, parseInt(grid.dataset.totalProjects));
  }, 100);
}

function goToProjectSlide(slideIndex, cardsPerSlide) {
  const grid = document.getElementById("projects-grid");
  const cards = grid.querySelectorAll('.project-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;

  grid.scrollTo({
    left: slideIndex * slideDistance,
    behavior: 'smooth'
  });

  // Update indicators after scroll
  setTimeout(() => {
    updateProjectIndicators(cardsPerSlide, parseInt(grid.dataset.totalProjects));
  }, 100);
}

function updateProjectIndicators(cardsPerSlide, totalProjects) {
  const grid = document.getElementById("projects-grid");
  const cards = grid.querySelectorAll('.project-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;
  const currentSlide = Math.round(grid.scrollLeft / slideDistance);

  const indicators = document.querySelectorAll('.carousel-indicator');
  const totalSlides = Math.ceil(totalProjects / cardsPerSlide);

  indicators.forEach((ind, idx) => {
    ind.classList.toggle('active', idx === currentSlide);
  });

  // Update button disabled state with boundary checking
  const prevBtn = document.querySelector('.carousel-btn:first-of-type');
  const nextBtn = document.querySelector('.carousel-btn:last-of-type');

  if (prevBtn) {
    prevBtn.disabled = currentSlide <= 0;
  }
  
  if (nextBtn) {
    // Check if we're at or near the end
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    nextBtn.disabled = grid.scrollLeft >= maxScroll - 10;
  }
}

// Handle window resize for responsive carousel
window.addEventListener('resize', () => {
  const grid = document.getElementById("projects-grid");
  if (grid && grid.querySelector('.project-card')) {
    const totalProjects = grid.querySelectorAll('.project-card').length;
    if (totalProjects > 0) {
      initProjectsCarousel(totalProjects);
    }
  }
});

// ====== Case Studies Section ======
async function loadCaseStudies() {
  try {
    const caseStudies = await fetchJson(`${API_BASE_URL}/case-studies`);
    renderCaseStudies(caseStudies);
  } catch (err) {
    // Fallback to config file
    try {
      const config = await fetchJson(CONFIG_PATH);
      renderCaseStudies(config.caseStudies);
    } catch (fallbackErr) {
      console.error('Failed to load case studies:', fallbackErr);
    }
  }
}

function renderCaseStudies(caseStudies) {
  const container = document.getElementById("case-studies-container");
  if (!container) return;
  
  container.innerHTML = "";
  caseStudies.forEach((study, idx) => {
    const card = document.createElement("div");
    card.className = "case-study-card scroll-reveal";
    card.style.setProperty('animation-delay', `${idx * 0.1}s`);
    
    let resultsList = '';
    if (study.results && Array.isArray(study.results)) {
      resultsList = study.results.map(result => 
        `<li>${result}</li>`
      ).join('');
    }

    let techStack = '';
    if (study.technologies && Array.isArray(study.technologies)) {
      techStack = study.technologies.map(tech => 
        `<span class="case-tech">${tech}</span>`
      ).join('');
    }

    const img = study.image ? `<img src="${study.image}" alt="${study.title}" class="case-study-image" />` : '';
    
    card.innerHTML = `
      ${img}
      <div class="case-study-content">
        <h3 class="case-study-title">${study.title}</h3>
        <p class="case-study-subtitle">${study.subtitle}</p>
        
        <div class="case-study-section">
          <h4>Challenge</h4>
          <p>${study.challenge}</p>
        </div>
        
        <div class="case-study-section">
          <h4>Solution</h4>
          <p>${study.solution}</p>
        </div>
        
        <div class="case-study-section">
          <h4>Results</h4>
          <ul class="results-list">
            ${resultsList}
          </ul>
        </div>
        
        ${techStack ? `<div class="case-study-tech">${techStack}</div>` : ''}
      </div>
    `;
    container.appendChild(card);
    observer.observe(card);
  });

  // Initialize case studies carousel after cards are rendered
  setTimeout(() => initCaseStudiesCarousel(caseStudies.length), 100);
}

// Case Studies Carousel Initialization
function initCaseStudiesCarousel(totalCaseStudies) {
  const container = document.getElementById("case-studies-container");
  const section = container.parentElement;

  // Create carousel controls container if it doesn't exist
  let controlsContainer = section.querySelector('.case-studies-carousel-container');
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'case-studies-carousel-container';
    section.appendChild(controlsContainer);
  }

  // Create controls
  const controls = document.createElement('div');
  controls.className = 'case-studies-carousel-controls';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'case-carousel-btn';
  prevBtn.innerHTML = '❮';
  prevBtn.addEventListener('click', () => scrollCaseStudies(-1));

  const indicators = document.createElement('div');
  indicators.className = 'case-carousel-indicators';

  // 2 cards per slide for case studies
  const cardsPerSlide = 2;
  const totalSlides = Math.ceil(totalCaseStudies / cardsPerSlide);

  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement('div');
    indicator.className = `case-carousel-indicator ${i === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToCaseStudySlide(i));
    indicators.appendChild(indicator);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'case-carousel-btn';
  nextBtn.innerHTML = '❯';
  nextBtn.addEventListener('click', () => scrollCaseStudies(1));

  controls.appendChild(prevBtn);
  controls.appendChild(indicators);
  controls.appendChild(nextBtn);

  // Clear and add controls
  controlsContainer.innerHTML = '';
  controlsContainer.appendChild(controls);

  // Update indicators on manual scroll
  container.addEventListener('scroll', () => updateCaseStudiesIndicators(totalCaseStudies));

  // Store carousel data
  container.dataset.cardsPerSlide = cardsPerSlide;
  container.dataset.totalSlides = totalSlides;
  container.dataset.totalCaseStudies = totalCaseStudies;
}

function scrollCaseStudies(direction) {
  const container = document.getElementById("case-studies-container");
  const cards = container.querySelectorAll('.case-study-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const cardsPerSlide = 2;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;

  container.scrollBy({
    left: direction * slideDistance,
    behavior: 'smooth'
  });

  setTimeout(() => updateCaseStudiesIndicators(cards.length), 100);
}

function goToCaseStudySlide(slideIndex) {
  const container = document.getElementById("case-studies-container");
  const cards = container.querySelectorAll('.case-study-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const cardsPerSlide = 2;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;

  container.scrollTo({
    left: slideIndex * slideDistance,
    behavior: 'smooth'
  });

  setTimeout(() => updateCaseStudiesIndicators(cards.length), 100);
}

function updateCaseStudiesIndicators(totalCaseStudies) {
  const container = document.getElementById("case-studies-container");
  const cards = container.querySelectorAll('.case-study-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const cardsPerSlide = 2;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;
  const currentSlide = Math.round(container.scrollLeft / slideDistance);

  const indicators = document.querySelectorAll('.case-carousel-indicator');
  indicators.forEach((ind, idx) => {
    ind.classList.toggle('active', idx === currentSlide);
  });

  // Update button disabled state with boundary checking
  const prevBtn = document.querySelector('.case-carousel-btn:first-of-type');
  const nextBtn = document.querySelector('.case-carousel-btn:last-of-type');

  if (prevBtn) {
    prevBtn.disabled = currentSlide <= 0;
  }
  
  if (nextBtn) {
    // Check if we're at or near the end
    const maxScroll = container.scrollWidth - container.clientWidth;
    nextBtn.disabled = container.scrollLeft >= maxScroll - 10;
  }
}

// ====== Design Section ======
async function loadDesign() {
  try {
    const designs = await fetchJson(`${API_BASE_URL}/design`);
    renderDesign(designs);
  } catch (err) {
    // Fallback to config file
    try {
      const config = await fetchJson(CONFIG_PATH);
      if (config.architecturalDesign && config.architecturalDesign.length > 0) {
        renderDesign(config.architecturalDesign);
      }
    } catch (fallbackErr) {
      console.error('Failed to load design section:', fallbackErr);
    }
  }
}

function renderDesign(designs) {
  const container = document.getElementById("design-container");
  if (!container || !designs || designs.length === 0) return;
  
  container.innerHTML = "";
  designs.forEach((design, idx) => {
    const card = document.createElement("div");
    card.className = "design-card scroll-reveal";
    card.style.setProperty('animation-delay', `${idx * 0.1}s`);
    
    let resultsList = '';
    if (design.highlights && Array.isArray(design.highlights)) {
      resultsList = design.highlights.map(highlight => 
        `<li>${highlight}</li>`
      ).join('');
    }

    let techStack = '';
    if (design.technologies && Array.isArray(design.technologies)) {
      techStack = design.technologies.map(tech => 
        `<span class="design-tech">${tech}</span>`
      ).join('');
    }

    const img = design.image ? `<img src="${design.image}" alt="${design.title}" class="design-image" />` : '';
    
    card.innerHTML = `
      ${img}
      <div class="design-content">
        <h3 class="design-title">${design.title}</h3>
        <p class="design-subtitle">${design.subtitle}</p>
        
        <div class="design-section">
          <h4>Concept</h4>
          <p>${design.concept}</p>
        </div>
        
        <div class="design-section">
          <h4>Highlights</h4>
          <ul class="design-highlights-list">
            ${resultsList}
          </ul>
        </div>
        
        ${techStack ? `<div class="design-tech-stack">${techStack}</div>` : ''}
      </div>
    `;
    container.appendChild(card);
    observer.observe(card);
  });

  // Initialize carousel after cards are rendered
  setTimeout(() => initDesignCarousel(designs.length), 100);
}

// Design Carousel Initialization
function initDesignCarousel(totalDesigns) {
  const container = document.getElementById("design-container");
  const section = container.parentElement;

  // Create carousel controls container if it doesn't exist
  let controlsContainer = section.querySelector('.design-carousel-container');
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'design-carousel-container';
    section.appendChild(controlsContainer);
  }

  // Create controls
  const controls = document.createElement('div');
  controls.className = 'design-carousel-controls';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'design-carousel-btn';
  prevBtn.innerHTML = '❮';
  prevBtn.addEventListener('click', () => scrollDesign(-1));

  const indicators = document.createElement('div');
  indicators.className = 'design-carousel-indicators';

  // 2 cards per slide for design
  const cardsPerSlide = 2;
  const totalSlides = Math.ceil(totalDesigns / cardsPerSlide);

  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement('div');
    indicator.className = `design-carousel-indicator ${i === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToDesignSlide(i));
    indicators.appendChild(indicator);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'design-carousel-btn';
  nextBtn.innerHTML = '❯';
  nextBtn.addEventListener('click', () => scrollDesign(1));

  controls.appendChild(prevBtn);
  controls.appendChild(indicators);
  controls.appendChild(nextBtn);

  // Clear and add controls
  controlsContainer.innerHTML = '';
  controlsContainer.appendChild(controls);

  // Update indicators on manual scroll
  container.addEventListener('scroll', () => updateDesignIndicators(totalDesigns));

  // Store carousel data
  container.dataset.cardsPerSlide = cardsPerSlide;
  container.dataset.totalSlides = totalSlides;
  container.dataset.totalDesigns = totalDesigns;
}

function scrollDesign(direction) {
  const container = document.getElementById("design-container");
  const cards = container.querySelectorAll('.design-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const cardsPerSlide = 2;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;

  container.scrollBy({
    left: direction * slideDistance,
    behavior: 'smooth'
  });

  setTimeout(() => updateDesignIndicators(cards.length), 100);
}

function goToDesignSlide(slideIndex) {
  const container = document.getElementById("design-container");
  const cards = container.querySelectorAll('.design-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const cardsPerSlide = 2;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;

  container.scrollTo({
    left: slideIndex * slideDistance,
    behavior: 'smooth'
  });

  setTimeout(() => updateDesignIndicators(cards.length), 100);
}

function updateDesignIndicators(totalDesigns) {
  const container = document.getElementById("design-container");
  const cards = container.querySelectorAll('.design-card');
  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = 32;
  const cardsPerSlide = 2;
  const slideDistance = (cardWidth + gap) * cardsPerSlide;
  const currentSlide = Math.round(container.scrollLeft / slideDistance);

  const indicators = document.querySelectorAll('.design-carousel-indicator');
  indicators.forEach((ind, idx) => {
    ind.classList.toggle('active', idx === currentSlide);
  });

  // Update button disabled state with boundary checking
  const prevBtn = document.querySelector('.design-carousel-btn:first-of-type');
  const nextBtn = document.querySelector('.design-carousel-btn:last-of-type');

  if (prevBtn) {
    prevBtn.disabled = currentSlide <= 0;
  }
  
  if (nextBtn) {
    // Check if we're at or near the end
    const maxScroll = container.scrollWidth - container.clientWidth;
    nextBtn.disabled = container.scrollLeft >= maxScroll - 10;
  }
}

// ====== Skills Section ======
async function loadSkills() {
  try {
    const skills = await fetchJson(`${API_BASE_URL}/skills`);
    renderSkills(skills);
  } catch (err) {
    // Fallback to default skills
    try {
      const config = await fetchJson(CONFIG_PATH);
      renderSkills(config.skills || getDefaultSkills());
    } catch (fallbackErr) {
      renderSkills(getDefaultSkills());
    }
  }
}

function getDefaultSkills() {
  return {
    "BIM & AEC": [
      { name: "Revit", icon: "🏗️" },
      { name: "AutoCAD", icon: "📐" },
      { name: "Navisworks", icon: "🔍" },
      { name: "BIM 360", icon: "☁️" }
    ],
    "Project Management": [
      { name: "Agile/Scrum", icon: "📊" },
      { name: "BIM PM", icon: "📋" },
      { name: "MS Project", icon: "📅" },
      { name: "Jira", icon: "⚙️" }
    ],
    "Software & Development": [
      { name: "C#/.NET", icon: "💻" },
      { name: "Python", icon: "🐍" },
      { name: "JavaScript", icon: "⚡" },
      { name: "React", icon: "⚛️" }
    ],
    "Cloud & Infrastructure": [
      { name: "Azure", icon: "☁️" },
      { name: "AWS", icon: "🚀" },
      { name: "Docker", icon: "🐳" },
      { name: "Kubernetes", icon: "⚓" }
    ]
  };
}

function renderSkills(skillsData) {
  const container = document.getElementById("skills-container");
  if (!container) return;
  
  container.innerHTML = "";
  let categoryIndex = 0;

  for (const [category, skills] of Object.entries(skillsData)) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "skill-matrix scroll-reveal";
    categoryDiv.style.setProperty('animation-delay', `${categoryIndex * 0.1}s`);
    
    let categoryHTML = `
      <div class="skill-matrix-header">
        <h3>${category}</h3>
      </div>
      <div class="skill-matrix-grid">
    `;
    
    skills.forEach(skill => {
      categoryHTML += `
        <div class="skill-card">
          <div class="skill-icon-large">${skill.icon || '⭐'}</div>
          <div class="skill-name">${skill.name}</div>
        </div>
      `;
    });
    
    categoryHTML += '</div>';
    categoryDiv.innerHTML = categoryHTML;
    container.appendChild(categoryDiv);
    observer.observe(categoryDiv);
    categoryIndex++;
  }

  // Mark as active on scroll reveal
  setTimeout(() => {
    const skillMatrices = document.querySelectorAll('.skill-matrix');
    skillMatrices.forEach(matrix => {
      const rect = matrix.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        matrix.classList.add('active');
      }
    });
  }, 500);
}

// ====== Contact Form ======
function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.textContent = "Sending...";
    status.className = 'loading';
    const payload = { name: form.name.value, email: form.email.value, message: form.message.value };
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        status.textContent = data.message || "Message sent successfully!";
        status.className = 'success';
        form.reset();
      } else {
        status.textContent = "Error sending message. Please try again.";
        status.className = 'error';
      }
    } catch (err) {
      status.textContent = "Error sending message.";
      status.className = 'error';
    }
  });
}

// ====== Theme Toggle ======
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    html.classList.add('dark-mode');
    setThemeIcon(toggle, true);
  } else {
    html.classList.remove('dark-mode');
    setThemeIcon(toggle, false);
  }
  
  toggle.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark-mode');
    setThemeIcon(toggle, isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

function setThemeIcon(button, isDark) {
  if (isDark) {
    button.innerHTML = '☀️';
    button.setAttribute('aria-label', 'Switch to light mode');
  } else {
    button.innerHTML = '🌙';
    button.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// Enhanced scroll event listener for real-time carousel indicator updates
document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById("projects-grid");
  if (projectsGrid) {
    projectsGrid.addEventListener('scroll', () => {
      const cardsPerSlide = parseInt(projectsGrid.dataset.cardsPerSlide);
      const totalProjects = parseInt(projectsGrid.dataset.totalProjects);
      if (cardsPerSlide && totalProjects) {
        updateProjectIndicators(cardsPerSlide, totalProjects);
      }
    }, { passive: true });
  }

  const caseStudiesContainer = document.getElementById("case-studies-container");
  if (caseStudiesContainer) {
    caseStudiesContainer.addEventListener('scroll', () => {
      const totalCaseStudies = caseStudiesContainer.querySelectorAll('.case-study-card').length;
      if (totalCaseStudies > 0) {
        updateCaseStudiesIndicators(totalCaseStudies);
      }
    }, { passive: true });
  }

  const designContainer = document.getElementById("design-container");
  if (designContainer) {
    designContainer.addEventListener('scroll', () => {
      const totalDesigns = designContainer.querySelectorAll('.design-card').length;
      if (totalDesigns > 0) {
        updateDesignIndicators(totalDesigns);
      }
    }, { passive: true });
  }
});
