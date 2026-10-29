mountChrome("index.html");

document.getElementById("stat-restaurants").textContent = RESTAURANTS.length;

// ── City dropdowns ───────────────────────────────────────────────────────
["hero-city", "pref-city"].forEach(id => {
  const sel = document.getElementById(id);
  CITIES.forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
});

const budgetSel = document.getElementById("pref-budget");
BUDGET_BANDS.forEach(b => {
  const o = document.createElement("option");
  o.value = b.id; o.textContent = b.label;
  budgetSel.appendChild(o);
});

// ── Cuisine browse grid ──────────────────────────────────────────────────
const counts = {};
RESTAURANTS.forEach(r => r.cuisines.forEach(c => { counts[c] = (counts[c] || 0) + 1; }));

document.getElementById("cuisine-grid").innerHTML = CUISINES.map(c => {
  const st = CUISINE_STYLE[c] || { emoji: "🍽️" };
  return `<a class="cuisine-card" href="explore.html?cuisine=${encodeURIComponent(c)}">
    <span class="cc-emoji">${st.emoji}</span>
    <div class="cc-name">${c}</div>
    <div class="cc-count">${counts[c] || 0} places</div>
  </a>`;
}).join("");

// ── Preference controls ──────────────────────────────────────────────────
const prefs = Prefs.get();

document.getElementById("pref-city").value = prefs.city || "";
document.getElementById("pref-budget").value = prefs.budgetBand || "";
document.getElementById("pref-ambience").value = (prefs.ambience || [])[0] || "";

document.getElementById("pref-cuisines").innerHTML = CUISINES.map(c =>
  `<button type="button" class="pill${prefs.cuisines.includes(c) ? " on" : ""}" data-cuisine="${c}">${c}</button>`
).join("");

document.querySelectorAll("#pref-diet .pill").forEach(btn => {
  if ((prefs.diet || []).includes(btn.dataset.diet)) btn.classList.add("on");
});

function currentPrefs() {
  const amb = document.getElementById("pref-ambience").value;
  return {
    city: document.getElementById("pref-city").value,
    budgetBand: document.getElementById("pref-budget").value,
    ambience: amb ? [amb] : [],
    cuisines: [...document.querySelectorAll("#pref-cuisines .pill.on")].map(b => b.dataset.cuisine),
    diet: [...document.querySelectorAll("#pref-diet .pill.on")].map(b => b.dataset.diet),
  };
}

function savePrefsAndRender() {
  const p = currentPrefs();
  Prefs.set(p);
  renderRecommended(p);
}

["pref-city", "pref-budget", "pref-ambience"].forEach(id => {
  document.getElementById(id).addEventListener("change", savePrefsAndRender);
});

["pref-cuisines", "pref-diet"].forEach(id => {
  document.getElementById(id).addEventListener("click", e => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    pill.classList.toggle("on");
    savePrefsAndRender();
  });
});

// ── Recommended for you ──────────────────────────────────────────────────
function renderRecommended(p) {
  const grid = document.getElementById("recommended");
  grid.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;

  // Brief delay so the loading state is visible and the UI feels responsive.
  setTimeout(() => {
    const history = Feedback.history();
    const filters = { city: p.city, diet: p.diet };
    const { results, coldStart } = recommend(filters, p, history, { sort: "relevance" });

    const top = results.slice(0, 6);
    const sub = document.getElementById("rec-sub");

    if (top.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="es-emoji">🍽️</div>
        <h3>No matches for those preferences</h3>
        <p>Try removing a dietary filter or choosing a different city.</p>
      </div>`;
      return;
    }

    const hasPrefs = p.cuisines.length || p.city || p.budgetBand || p.diet.length;
    sub.textContent = coldStart
      ? (hasPrefs
          ? "Matched to your stated preferences. Like a few places and the collaborative arm kicks in."
          : "Showing popular picks — set preferences above or like a few places to personalise this.")
      : `Blended from your taste profile and ${history.length} restaurant${history.length === 1 ? "" : "s"} you've reacted to.`;

    grid.innerHTML = top.map((r, i) =>
      restaurantCard(r, { rank: i === 0 ? "Top pick" : "" })).join("");
  }, 180);
}

renderRecommended(currentPrefs());
wireCardActions(document.getElementById("recommended"), () => renderRecommended(currentPrefs()));

// ── Trending ─────────────────────────────────────────────────────────────
const trending = [...RESTAURANTS]
  .sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating))
  .slice(0, 8);
const trendingEl = document.getElementById("trending");
trendingEl.innerHTML = trending.map(r => restaurantCard(r, { explanation: false })).join("");
wireCardActions(trendingEl);

// ── Recently viewed ──────────────────────────────────────────────────────
const recentIds = Recent.list();
if (recentIds.length) {
  const section = document.getElementById("recent-section");
  section.style.display = "";
  const items = recentIds.map(id => RESTAURANTS.find(r => r.id === id)).filter(Boolean);
  const el = document.getElementById("recent");
  el.innerHTML = items.map(r => restaurantCard(r, { explanation: false })).join("");
  wireCardActions(el);
}

// Carry the hero search straight into Explore.
document.getElementById("hero-search").addEventListener("submit", e => {
  e.preventDefault();
  const q = document.getElementById("hero-q").value.trim();
  const city = document.getElementById("hero-city").value;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (city) params.set("city", city);
  window.location.href = "explore.html" + (params.toString() ? "?" + params : "");
});
