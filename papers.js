const THEMES = [
  "Collaborative Filtering",
  "Content-Based",
  "Sentiment Analysis",
  "Hybrid",
  "Deep Learning",
  "Evaluation",
  "Explainability",
  "Optimization",
];

let activeTheme = "all";
let searchTerm = "";

function buildFilters() {
  const bar = document.getElementById("theme-filters");
  const used = new Set();
  PAPERS.forEach(p => (p.themes || []).forEach(t => used.add(t)));

  const options = ["all", ...THEMES.filter(t => used.has(t))];
  options.forEach(theme => {
    const btn = document.createElement("button");
    btn.className = "filter-chip" + (theme === "all" ? " active" : "");
    btn.textContent = theme === "all" ? "All papers" : theme;
    btn.addEventListener("click", () => {
      activeTheme = theme;
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    bar.appendChild(btn);
  });
}

function matches(paper) {
  if (paper.status === "pending") return activeTheme === "all" && searchTerm === "";

  const themeOk = activeTheme === "all" || (paper.themes || []).includes(activeTheme);
  if (!themeOk) return false;

  if (searchTerm === "") return true;
  const haystack = [paper.title, paper.authors, paper.venue, paper.summary, paper.relevance]
    .filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(searchTerm);
}

function filledCard(paper, index) {
  const card = document.createElement("article");
  card.className = "paper-card";

  const themes = (paper.themes || [])
    .map(t => `<span class="paper-tag">${t}</span>`).join("");

  card.innerHTML = `
    <div class="paper-num">${index}</div>
    <div class="paper-body">
      <h3>${paper.title}</h3>
      <div class="paper-meta">${paper.authors} &middot; <em>${paper.venue}</em> &middot; ${paper.year}</div>
      <div class="paper-tags">${themes}</div>
      <div class="paper-block">
        <span class="paper-label">What it does</span>
        <p>${paper.summary}</p>
      </div>
      <div class="paper-block">
        <span class="paper-label">Why it matters here</span>
        <p>${paper.relevance}</p>
      </div>
    </div>
  `;
  return card;
}

function pendingCard(paper, index) {
  const card = document.createElement("article");
  card.className = "paper-card pending";
  card.innerHTML = `
    <div class="paper-num">${index}</div>
    <div class="paper-body">
      <h3>Paper ${index} &mdash; awaiting content</h3>
      <div class="paper-meta">Populate this entry from the 19-page literature review document.</div>
    </div>
  `;
  return card;
}

function render() {
  const list = document.getElementById("papers-list");
  list.innerHTML = "";

  let shown = 0;
  PAPERS.forEach((paper, i) => {
    if (!matches(paper)) return;
    shown++;
    const index = paper.slot || i + 1;
    list.appendChild(paper.status === "pending" ? pendingCard(paper, index) : filledCard(paper, index));
  });

  const count = document.getElementById("papers-count");
  if (shown === 0) {
    list.innerHTML = `<div class="paper-card"><div class="paper-body"><h3>No matching papers</h3><div class="paper-meta">Try a different theme or clear the search.</div></div></div>`;
    count.textContent = `0 of ${PAPERS.length} shown`;
  } else {
    count.textContent = shown === PAPERS.length
      ? `${PAPERS.length} papers`
      : `${shown} of ${PAPERS.length} shown`;
  }
}

document.getElementById("paper-search").addEventListener("input", e => {
  searchTerm = e.target.value.trim().toLowerCase();
  render();
});

buildFilters();
render();
