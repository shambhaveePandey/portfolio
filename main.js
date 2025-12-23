// API base: replace window.__API_BASE_URL__ at build-time or leave for runtime
const API_BASE_URL = window.__API_BASE_URL__ || '/api';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return await res.json();
}

async function loadAbout() {
  const about = await fetchJson(`${API_BASE_URL}/about`);
  const container = document.getElementById("about-container");
  container.innerHTML = `<h1>${about.name}</h1><p>${about.title}</p><p>${about.summary}</p>`;
}

async function loadProjects() {
  const projects = await fetchJson(`${API_BASE_URL}/projects`);
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "";
  projects.forEach(p => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p>${p.link?`<a href="${p.link}" target="_blank">View</a>`:""}`;
    grid.appendChild(card);
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.textContent = "Sending...";
    const payload = { name: form.name.value, email: form.email.value, message: form.message.value };
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      status.textContent = res.ok && data.success ? (data.message || "Sent") : "Error";
      if (res.ok) form.reset();
    } catch {
      status.textContent = "Error sending message.";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  initContactForm();
  loadAbout().catch(()=>{});
  loadProjects().catch(()=>{});
});

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carousel-track');
  if (!track) return; // no carousel present

  const items = Array.from(track.children);
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const dotsContainer = document.getElementById('carousel-dots');
  let index = 0;
  const total = items.length;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    Array.from(dotsContainer.children).forEach((d,i)=> d.classList.toggle('active', i===index));
    Array.from(dotsContainer.children).forEach((d,i)=> d.setAttribute('aria-selected', i===index ? 'true' : 'false'));
  }

  // build dots
  items.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'carousel-dot';
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-label', `Go to slide ${i+1}`);
    btn.addEventListener('click', ()=> { index = i; update(); });
    dotsContainer.appendChild(btn);
  });

  update();

  if (nextBtn) nextBtn.addEventListener('click', ()=> { index = (index + 1) % total; update(); });
  if (prevBtn) prevBtn.addEventListener('click', ()=> { index = (index - 1 + total) % total; update(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { index = (index + 1) % total; update(); }
    if (e.key === 'ArrowLeft')  { index = (index - 1 + total) % total; update(); }
  });

  // basic swipe support
  let startX = null;
  track.addEventListener('pointerdown', e => startX = e.clientX);
  track.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (dx > 40) index = (index - 1 + total) % total;
    else if (dx < -40) index = (index + 1) % total;
    startX = null;
    update();
  });

  // autoplay with pause on hover/focus
  let autoplay = setInterval(()=> { index = (index + 1) % total; update(); }, 5000);
  [track, nextBtn, prevBtn, dotsContainer].forEach(el => {
    if (!el) return;
    el.addEventListener('mouseenter', ()=> clearInterval(autoplay));
    el.addEventListener('focusin', ()=> clearInterval(autoplay));
    el.addEventListener('mouseleave', ()=> autoplay = setInterval(()=> { index = (index + 1) % total; update(); }, 5000));
    el.addEventListener('focusout', ()=> autoplay = setInterval(()=> { index = (index + 1) % total; update(); }, 5000));
  });
});

(() => {
  // Simple project data (replace or extend)
  const projects = [
    { title: "Project One", desc: "Description for project one.", thumb: "https://via.placeholder.com/400x240?text=1", href: "#" },
    { title: "Project Two", desc: "Description for project two.", thumb: "https://via.placeholder.com/400x240?text=2", href: "#" },
    { title: "Project Three", desc: "Description for project three.", thumb: "https://via.placeholder.com/400x240?text=3", href: "#" }
  ];

  const list = document.getElementById('projects-list');
  const tpl = document.getElementById('project-template');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dotsContainer = document.getElementById('carousel-dots');
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');

  let current = 0;
  let items = [];

  function render() {
    projects.forEach((p, i) => {
      const clone = tpl.content.cloneNode(true);
      const li = clone.querySelector('li');
      const link = clone.querySelector('.project-link');
      const img = clone.querySelector('.project-thumb');
      const title = clone.querySelector('.project-title');
      const desc = clone.querySelector('.project-desc');

      link.href = p.href;
      img.src = p.thumb;
      img.alt = p.title;
      title.textContent = p.title;
      desc.textContent = p.desc;

      // accessibility defaults
      li.setAttribute('aria-hidden', 'true');
      li.tabIndex = -1;

      list.appendChild(clone);
    });

    items = Array.from(list.querySelectorAll('.project-item'));
    buildDots();
    update();
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    items.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'projects-list');
      btn.addEventListener('click', () => { goTo(i); });
      dotsContainer.appendChild(btn);
    });
  }

  function update() {
    items.forEach((li, i) => {
      const isActive = i === current;
      li.hidden = !isActive;
      li.setAttribute('aria-hidden', String(!isActive));
      const link = li.querySelector('.project-link');
      if (isActive) {
        link.tabIndex = 0;
        // focus the first interactive element in the slide if desired:
        // link.focus();
      } else {
        link.tabIndex = -1;
      }
    });

    // update dots
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, i) => {
      d.setAttribute('aria-selected', String(i === current));
      d.tabIndex = i === current ? 0 : -1;
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === items.length - 1;
  }

  function goTo(index) {
    if (index < 0) index = 0;
    if (index > items.length - 1) index = items.length - 1;
    current = index;
    update();
    // announce change for screen readers (optional explicit announcement)
    list.setAttribute('aria-live', 'polite');
  }

  function prev() { goTo(current - 1); }
  function next() { goTo(current + 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // basic contact form handler (prevent real submit)
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactStatus.textContent = 'Sending...';
      // Simulate async send
      setTimeout(() => {
        contactStatus.textContent = 'Message sent — thank you!';
        contactForm.reset();
      }, 800);
    });
  }

  // init
  render();
})();
