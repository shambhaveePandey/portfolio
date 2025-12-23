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
