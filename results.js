let activeDataset = RESULTS.datasets[0].id;

const fmt = v => (v === null || v === undefined) ? null : Number(v).toFixed(4);

function bestValue(values, better) {
  const nums = values.filter(v => v !== null && v !== undefined);
  if (nums.length < 2) return null;
  return better === "lower" ? Math.min(...nums) : Math.max(...nums);
}

function cell(value, isBest) {
  const shown = fmt(value);
  if (shown === null) return `<td class="val empty">—</td>`;
  return `<td class="val${isBest ? " best" : ""}">${shown}</td>`;
}

function renderRatingTable() {
  const ds = activeDataset;
  const head = RESULTS.metrics.map(m => `<th>${m.label}</th>`).join("");

  const bests = {};
  RESULTS.metrics.forEach(m => {
    bests[m.key] = bestValue(RESULTS.ratingModels.map(r => r[ds][m.key]), m.better);
  });

  const rows = RESULTS.ratingModels.map(r => {
    const badge = r.role === "baseline"
      ? `<span class="badge badge-base">Baseline</span>`
      : `<span class="badge badge-adv">Advanced</span>`;
    const cells = RESULTS.metrics.map(m => {
      const v = r[ds][m.key];
      return cell(v, v !== null && v === bests[m.key]);
    }).join("");
    return `<tr><td class="model-name">${r.model} ${badge}</td>${cells}</tr>`;
  }).join("");

  document.getElementById("rating-table").innerHTML = `
    <table>
      <thead><tr><th>Model</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderSentimentTable() {
  const head = RESULTS.sentimentMetrics.map(m => `<th>${m.label}</th>`).join("");

  const bests = {};
  RESULTS.sentimentMetrics.forEach(m => {
    bests[m.key] = bestValue(RESULTS.sentimentModels.map(r => r[m.key]), m.better);
  });

  const rows = RESULTS.sentimentModels.map(r => {
    const cells = RESULTS.sentimentMetrics.map(m => {
      const v = r[m.key];
      return cell(v, v !== null && v === bests[m.key]);
    }).join("");
    return `<tr><td class="model-name">${r.model} <span class="badge badge-sent">${r.note}</span></td>${cells}</tr>`;
  }).join("");

  document.getElementById("sentiment-table").innerHTML = `
    <table>
      <thead><tr><th>Model</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderFusionTable() {
  const rows = RESULTS.fusionComparison.map(r => {
    const fixed = fmt(r.fixed);
    const pers = fmt(r.personalized);

    let delta = `<td class="val empty">—</td>`;
    if (r.fixed !== null && r.personalized !== null) {
      const d = r.personalized - r.fixed;
      const cls = d > 0 ? "up" : d < 0 ? "down" : "";
      const sign = d > 0 ? "+" : "";
      delta = `<td class="val delta ${cls}">${sign}${d.toFixed(4)}</td>`;
    }

    const best = (r.fixed !== null && r.personalized !== null)
      ? (r.personalized > r.fixed ? "pers" : r.fixed > r.personalized ? "fixed" : "")
      : "";

    return `<tr>
      <td class="model-name">${r.dataset}</td>
      <td>${r.metric}</td>
      <td class="val${best === "fixed" ? " best" : ""}">${fixed === null ? "—" : fixed}</td>
      <td class="val${best === "pers" ? " best" : ""}">${pers === null ? "—" : pers}</td>
      ${delta}
    </tr>`;
  }).join("");

  document.getElementById("fusion-table").innerHTML = `
    <table>
      <thead><tr><th>Dataset</th><th>Metric</th><th>Fixed weights</th><th>Personalized (NNLS)</th><th>Change</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildDatasetToggle() {
  const bar = document.getElementById("dataset-toggle");
  RESULTS.datasets.forEach(d => {
    const btn = document.createElement("button");
    btn.className = "filter-chip" + (d.id === activeDataset ? " active" : "");
    btn.textContent = d.label;
    btn.addEventListener("click", () => {
      activeDataset = d.id;
      bar.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      renderRatingTable();
    });
    bar.appendChild(btn);
  });
}

buildDatasetToggle();
renderRatingTable();
renderSentimentTable();
renderFusionTable();

// Note the K used for @K metrics wherever it's referenced in the copy.
document.querySelectorAll(".k-value").forEach(el => { el.textContent = RESULTS.k; });
