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
    header.classList.add('visible');
  });

  header.addEventListener('mouseleave', () => {
    if (window.scrollY > 100) {
      header.classList.remove('visible');
    }
  });

  // Show header on scroll up
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY || currentScrollY < 100) {
      // Scrolling up or near top
      header.classList.add('visible');
    } else if (currentScrollY > 300) {
      // Scrolling down past threshold
      header.classList.remove('visible');
    }

    lastScrollY = currentScrollY;

    // Hide header after scrolling stops (unless user hovers)
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (window.scrollY > 300 && !header.matches(':hover')) {
        header.classList.remove('visible');
      }
    }, 2000);
  });
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
}

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
  if (!container) return; // Section not in DOM yet
  
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
