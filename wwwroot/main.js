const API_BASE_URL = "https://localhost:5500";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return await res.json();
}

async function loadAbout() {
  try {
    const about = await fetchJson(`${API_BASE_URL}/api/about`);
    const container = document.getElementById("about-container");
    container.innerHTML = `
      <h1>${about.name}</h1>
      <p>${about.title}</p>
      <p>${about.summary}</p>
      <p><strong>Location:</strong> ${about.location}</p>
    `;
  } catch (err) {
    console.error(err);
  }
}

async function loadProjects() {
  try {
    const projects = await fetchJson(`${API_BASE_URL}/api/projects`);
    const grid = document.getElementById("projects-grid");
    grid.innerHTML = "";
    projects.forEach(p => {
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <a href="${p.link}" target="_blank" rel="noopener noreferrer">View project</a>
        <div class="project-tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sending...";
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        status.textContent = result.message || "Message sent!";
        form.reset();
      } else {
        status.textContent = "Something went wrong.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "Error sending message.";
    }
  });
}

function initMeta() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  initMeta();
  initContactForm();
  loadAbout();
  loadProjects();
});
