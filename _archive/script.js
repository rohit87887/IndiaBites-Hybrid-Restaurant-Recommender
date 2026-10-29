// Small illustrative sample menu — NOT the trained models or real datasets.
const SAMPLE_RESTAURANTS = [
  { name: "Trattoria Bella", cuisine: "Italian", price: 3, veg: false, distanceKm: 3.2, cf: 0.92, content: 0.7, sentiment: 0.88, peers: 214, reviewNote: "reviewers repeatedly praise the fresh pasta and attentive service" },
  { name: "Nonna's Table", cuisine: "Italian", price: 2, veg: true, distanceKm: 6.5, cf: 0.65, content: 0.85, sentiment: 0.55, peers: 98, reviewNote: "solid ratings, but review text mentions inconsistent wait times" },
  { name: "Saravana Bhavan Express", cuisine: "South Indian", price: 1, veg: true, distanceKm: 1.4, cf: 0.88, content: 0.9, sentiment: 0.93, peers: 341, reviewNote: "consistently high praise for taste and value in reviews" },
  { name: "Dosa Corner", cuisine: "South Indian", price: 1, veg: true, distanceKm: 4.1, cf: 0.6, content: 0.8, sentiment: 0.7, peers: 120, reviewNote: "decent sentiment, fewer similar-diner ratings to go on" },
  { name: "Chettinad Spice House", cuisine: "South Indian", price: 2, veg: false, distanceKm: 7.8, cf: 0.79, content: 0.83, sentiment: 0.75, peers: 165, reviewNote: "known for bold non-veg curries, reviews mention generous portions" },
  { name: "Punjabi Tadka", cuisine: "North Indian", price: 2, veg: true, distanceKm: 2.9, cf: 0.81, content: 0.75, sentiment: 0.6, peers: 176, reviewNote: "high ratings but reviews flag portion sizes as inconsistent" },
  { name: "Royal Mughlai House", cuisine: "North Indian", price: 3, veg: false, distanceKm: 9.3, cf: 0.9, content: 0.68, sentiment: 0.82, peers: 260, reviewNote: "similar diners rate it highly, and review sentiment agrees" },
  { name: "Golden Dragon Wok", cuisine: "Chinese", price: 2, veg: false, distanceKm: 5.6, cf: 0.74, content: 0.82, sentiment: 0.77, peers: 150, reviewNote: "balanced positive sentiment across recent reviews" },
  { name: "Szechuan Street", cuisine: "Chinese", price: 1, veg: true, distanceKm: 1.9, cf: 0.55, content: 0.6, sentiment: 0.5, peers: 64, reviewNote: "mixed reviews on spice consistency" },
  { name: "The Daily Grind Cafe", cuisine: "Cafe", price: 2, veg: true, distanceKm: 0.8, cf: 0.7, content: 0.88, sentiment: 0.85, peers: 190, reviewNote: "reviewers love the ambience and coffee quality" },
  { name: "Bean & Batter", cuisine: "Cafe", price: 1, veg: true, distanceKm: 3.5, cf: 0.5, content: 0.72, sentiment: 0.6, peers: 80, reviewNote: "positive but limited review volume" },
];

// Mood maps to how much the system trusts each signal — this is what the
// "personalized fusion weights" idea looks like from the outside: the user
// never sets a weight, the context implies one.
const MOOD_PROFILES = {
  familiar: { cf: 0.55, content: 0.25, sentiment: 0.2, label: "leaning on what similar diners already trust" },
  adventurous: { cf: 0.2, content: 0.55, sentiment: 0.25, label: "leaning on taste-profile match over crowd habits" },
  safe: { cf: 0.25, content: 0.2, sentiment: 0.55, label: "leaning heavily on review sentiment for a safe bet" },
  quick: { cf: 0.35, content: 0.4, sentiment: 0.25, label: "balancing distance and straightforward taste match" },
};

function computeScore(r, weights, maxDistance) {
  const base = (r.cf * weights.cf) + (r.content * weights.content) + (r.sentiment * weights.sentiment);
  // Closer places get a small boost so "near me" actually matters, capped so it never dominates taste/quality.
  const proximityBoost = maxDistance >= 999 ? 0 : (1 - Math.min(r.distanceKm / maxDistance, 1)) * 0.12;
  return base + proximityBoost;
}

function explanationFor(r, moodKey) {
  const mood = MOOD_PROFILES[moodKey];
  const dietNote = r.veg ? "it's a veg option" : "it's a non-veg option";
  return `Recommended because ${r.reviewNote}, ${dietNote}, it's about ${r.distanceKm.toFixed(1)} km away, and it fits the vibe you picked (${mood.label}).`;
}

function renderResults() {
  const cuisine = document.getElementById("cuisine-select").value;
  const diet = document.getElementById("diet-select").value;
  const maxDistance = Number(document.getElementById("distance-select").value);
  const moodKey = document.getElementById("mood-select").value;
  const weights = MOOD_PROFILES[moodKey];

  let pool = SAMPLE_RESTAURANTS.filter(r => {
    const cuisineOk = cuisine === "all" || r.cuisine === cuisine;
    const dietOk = diet === "all" || (diet === "veg" && r.veg) || (diet === "nonveg" && !r.veg);
    const distanceOk = maxDistance >= 999 || r.distanceKm <= maxDistance;
    return cuisineOk && dietOk && distanceOk;
  });

  const container = document.getElementById("demo-results");
  container.innerHTML = "";

  if (pool.length === 0) {
    const empty = document.createElement("div");
    empty.className = "result-card";
    empty.innerHTML = `<div><div class="r-name">No close match nearby</div><div class="r-meta">Try widening the distance or switching veg/non-veg.</div></div>`;
    container.appendChild(empty);
    return;
  }

  const scored = pool.map(r => ({
    ...r,
    score: computeScore(r, weights, maxDistance),
  })).sort((a, b) => b.score - a.score).slice(0, 3);

  scored.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card";
    const priceLabel = "₹".repeat(r.price);
    const dietLabel = r.veg ? "Veg" : "Non-veg";
    const rankLabel = i === 0 ? "Top pick" : `#${i + 1}`;
    card.innerHTML = `
      <div>
        <div class="r-name">${rankLabel === "Top pick" ? "⭐ " : ""}${r.name}</div>
        <div class="r-meta">${r.cuisine} &middot; ${dietLabel} &middot; ${priceLabel} &middot; ${r.distanceKm.toFixed(1)} km away &middot; ${r.peers} similar-diner ratings</div>
        <div class="r-explain">${explanationFor(r, moodKey)}</div>
      </div>
      <div class="score-pill">${Math.round(r.score * 100)}% match</div>
    `;
    container.appendChild(card);
  });
}

["cuisine-select", "diet-select", "distance-select", "mood-select"].forEach(id => {
  document.getElementById(id).addEventListener("change", renderResults);
});

renderResults();

// mobile nav toggle (graceful no-op if not present)
const navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("open");
  });
}
