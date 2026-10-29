mountChrome("explore.html");

const params = new URLSearchParams(window.location.search);
const prefs = Prefs.get();

// ── Populate controls ────────────────────────────────────────────────────
const citySel = document.getElementById("f-city");
CITIES.forEach(c => {
  const o = document.createElement("option");
  o.value = c; o.textContent = c;
  citySel.appendChild(o);
});

const budgetSel = document.getElementById("f-budget");
BUDGET_BANDS.forEach(b => {
  const o = document.createElement("option");
  o.value = b.id; o.textContent = b.label;
  budgetSel.appendChild(o);
});

document.getElementById("f-cuisines").innerHTML = CUISINES.map(c =>
  `<label class="check"><input type="checkbox" data-cuisine="${c}"> ${c}</label>`
).join("");

// ── Seed from URL, then from saved preferences ───────────────────────────
const qFromUrl = params.get("q") || "";
document.getElementById("f-query").value = qFromUrl;

const cityFromUrl = params.get("city") || prefs.city || "";
if (cityFromUrl && CITIES.includes(cityFromUrl)) citySel.value = cityFromUrl;

const cuisineFromUrl = params.get("cuisine");
if (cuisineFromUrl) {
  const box = document.querySelector(`#f-cuisines input[data-cuisine="${CSS.escape(cuisineFromUrl)}"]`);
  if (box) box.checked = true;
} else {
  prefs.cuisines.forEach(c => {
    const box = document.querySelector(`#f-cuisines input[data-cuisine="${CSS.escape(c)}"]`);
    if (box) box.checked = true;
  });
}

if (prefs.budgetBand) budgetSel.value = prefs.budgetBand;
(prefs.diet || []).forEach(d => {
  const box = document.querySelector(`input[data-diet="${d}"]`);
  if (box) box.checked = true;
});

// Echo the search term as TEXT — never as markup.
if (qFromUrl) {
  document.getElementById("page-title").textContent = `Results for “${qFromUrl}”`;
}

// ── Locality list follows the selected city ──────────────────────────────
function refreshLocalities() {
  const city = citySel.value;
  const sel = document.getElementById("f-locality");
  const current = sel.value;
  const localities = [...new Set(
    RESTAURANTS.filter(r => !city || r.city === city).map(r => r.locality)
  )].sort();

  sel.innerHTML = `<option value="">All localities</option>`;
  localities.forEach(l => {
    const o = document.createElement("option");
    o.value = l; o.textContent = l;
    sel.appendChild(o);
  });
  if (localities.includes(current)) sel.value = current;
}
refreshLocalities();

// ── Read the current filter state ────────────────────────────────────────
function readFilters() {
  return {
    query: document.getElementById("f-query").value,
    city: citySel.value,
    locality: document.getElementById("f-locality").value,
    cuisines: [...document.querySelectorAll("#f-cuisines input:checked")].map(b => b.dataset.cuisine),
    budgetBand: budgetSel.value,
    minRating: Number(document.querySelector("#f-rating .pill.on")?.dataset.rating || 0),
    diet: [...document.querySelectorAll("input[data-diet]:checked")].map(b => b.dataset.diet),
    facilities: [...document.querySelectorAll("input[data-fac]:checked")].map(b => b.dataset.fac),
  };
}

// Filters double as soft preferences for the content arm, layered over the
// taste profile saved on the home page.
function softPrefs(filters) {
  return {
    cuisines: filters.cuisines.length ? filters.cuisines : prefs.cuisines,
    city: filters.city || prefs.city,
    budgetBand: filters.budgetBand || prefs.budgetBand,
    diet: filters.diet.length ? filters.diet : prefs.diet,
    ambience: prefs.ambience || [],
    facilities: filters.facilities,
  };
}

// ── Render ───────────────────────────────────────────────────────────────
const resultsEl = document.getElementById("results");
const countEl = document.getElementById("results-count");
let renderTimer = null;

function render() {
  resultsEl.innerHTML = `<div class="skeleton-grid">
    <div class="skeleton"></div><div class="skeleton"></div>
    <div class="skeleton"></div><div class="skeleton"></div></div>`;
  countEl.textContent = "Searching…";

  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    const filters = readFilters();
    const sort = document.getElementById("f-sort").value;
    const { results, coldStart } = recommend(filters, softPrefs(filters), Feedback.history(), { sort });

    if (results.length === 0) {
      countEl.textContent = "No results";
      resultsEl.innerHTML = `<div class="empty-state">
        <div class="es-emoji">🔍</div>
        <h3>Nothing matches these filters</h3>
        <p>Try widening the budget, removing a dietary filter, or searching a different city.</p>
        <button class="btn btn-primary btn-sm" id="empty-clear">Clear all filters</button>
      </div>`;
      document.getElementById("empty-clear").addEventListener("click", clearAll);
      return;
    }

    countEl.innerHTML = `<strong>${results.length}</strong> restaurant${results.length === 1 ? "" : "s"} found`
      + (coldStart ? ` · ranked on taste match and popularity` : ` · personalised from your activity`);

    resultsEl.innerHTML = `<div class="resto-grid">`
      + results.map((r, i) => restaurantCard(r, { rank: i === 0 && sort === "relevance" ? "Best match" : "" })).join("")
      + `</div>`;
  }, 160);
}

function clearAll() {
  document.getElementById("f-query").value = "";
  citySel.value = "";
  budgetSel.value = "";
  document.querySelectorAll("#f-cuisines input, input[data-diet], input[data-fac]")
    .forEach(b => { b.checked = false; });
  document.querySelectorAll("#f-rating .pill").forEach(p => p.classList.remove("on"));
  document.querySelector('#f-rating .pill[data-rating="0"]').classList.add("on");
  refreshLocalities();
  render();
}

// ── Wiring ───────────────────────────────────────────────────────────────
document.getElementById("explore-search").addEventListener("submit", e => e.preventDefault());
document.getElementById("f-query").addEventListener("input", render);
citySel.addEventListener("change", () => { refreshLocalities(); render(); });
document.getElementById("f-locality").addEventListener("change", render);
budgetSel.addEventListener("change", render);
document.getElementById("f-sort").addEventListener("change", render);

document.querySelectorAll("#f-cuisines input, input[data-diet], input[data-fac]")
  .forEach(b => b.addEventListener("change", render));

document.getElementById("f-rating").addEventListener("click", e => {
  const pill = e.target.closest(".pill");
  if (!pill) return;
  document.querySelectorAll("#f-rating .pill").forEach(p => p.classList.remove("on"));
  pill.classList.add("on");
  render();
});

document.getElementById("clear-filters").addEventListener("click", clearAll);

wireCardActions(resultsEl, render);
render();
