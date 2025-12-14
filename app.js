// app.js

// Footer year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Animated counters on home page
function animateCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    counters.forEach(el => el.textContent = el.dataset.counter);
    return;
  }

  counters.forEach(el => {
    const target = parseFloat(el.dataset.counter);
    const isDecimal = String(el.dataset.counter).includes(".");
    const start = 0;
    const duration = 900;
    const startTime = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const val = start + (target - start) * t;
      el.textContent = isDecimal ? val.toFixed(1) : Math.round(val);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
animateCounters();

// Characters page filter + search
const grid = document.getElementById("characterGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll("[data-filter]");

function applyFilter(filter) {
  if (!grid) return;
  const cards = grid.querySelectorAll(".character");
  cards.forEach(card => {
    const tags = (card.getAttribute("data-tags") || "").toLowerCase();
    const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
    const desc = (card.querySelector("p")?.textContent || "").toLowerCase();
    const q = (searchInput?.value || "").trim().toLowerCase();

    const matchesFilter = (filter === "all") || tags.includes(filter);
    const matchesSearch = !q || tags.includes(q) || name.includes(q) || desc.includes(q);

    card.style.display = (matchesFilter && matchesSearch) ? "" : "none";
  });
}

let currentFilter = "all";
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter || "all";
    applyFilter(currentFilter);
  });
});

if (searchInput) {
  searchInput.addEventListener("input", () => applyFilter(currentFilter));
}
