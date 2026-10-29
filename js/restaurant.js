mountChrome("");

const root = document.getElementById("detail-root");
const id = new URLSearchParams(window.location.search).get("id");
// Only ever render from the local catalogue — never echo the raw URL value.
const r = RESTAURANTS.find(x => x.id === id);

if (!r) {
  root.innerHTML = `<div class="empty-state">
    <div class="es-emoji">🤷</div>
    <h3>Restaurant not found</h3>
    <p>That listing doesn't exist in the sample dataset.</p>
    <a class="btn btn-primary btn-sm" href="explore.html">Back to explore</a>
  </div>`;
} else {
  Recent.push(r.id);
  renderDetail(r);
}

function renderDetail(r) {
  const st = styleFor(r);
  const prefs = Prefs.get();
  const history = Feedback.history();

  // Re-score this one restaurant so the breakdown reflects the real engine.
  const scored = recommend({ query:"", city:"" }, prefs, history, { sort:"relevance" })
    .results.find(x => x.id === r.id);
  const parts = scored ? scored.parts : { content:0, collaborative:null, popularity:0, coldStart:true };
  const hybrid = scored ? scored.score : 0;

  const fb = Feedback.for(r.id);
  const pct = v => Math.round((v || 0) * 100);

  const collabLabel = parts.coldStart ? "Popularity (cold start)" : "Collaborative filtering";
  const collabVal = parts.coldStart ? parts.popularity : parts.collaborative;

  root.innerHTML = `
    <a href="explore.html" class="btn btn-ghost btn-sm" style="margin-bottom:20px;">&larr; Back to results</a>

    <div class="detail-hero" style="background:linear-gradient(135deg,${st.g[0]},${st.g[1]})">
      <span>${st.emoji}</span>
    </div>

    <div class="detail-grid">
      <div>
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;">
          <div>
            <h1 style="margin:0 0 8px;font-size:32px;">${r.name}</h1>
            <div style="color:var(--ink-soft);font-size:15px;">
              📍 ${r.locality}, ${r.city} &middot; ${r.pin}
            </div>
            <div style="margin-top:10px;color:var(--ink-faint);font-size:14px;">${r.cuisines.join(" · ")}</div>
          </div>
          <span class="sample-tag">Sample listing</span>
        </div>

        <div class="stat-row" style="margin-top:22px;">
          <div class="stat-box"><div class="sb-val">★ ${r.rating.toFixed(1)}</div><div class="sb-lab">Rating</div></div>
          <div class="stat-box"><div class="sb-val">${(r.reviews/1000).toFixed(1)}k</div><div class="sb-lab">Reviews</div></div>
          <div class="stat-box"><div class="sb-val">${rupees(r.cost)}</div><div class="sb-lab">For one</div></div>
          <div class="stat-box"><div class="sb-val">${r.diet.nonVeg ? "Veg + Non-veg" : "Pure veg"}</div><div class="sb-lab">Kitchen</div></div>
        </div>

        <div class="info-card">
          <h3>About</h3>
          <p style="margin:0;color:var(--ink-soft);font-size:15px;">${r.desc}</p>
        </div>

        <div class="info-card">
          <h3>Sample dishes</h3>
          <div class="dish-list">
            ${r.dishes.map(d => `<div class="dish-item"><span>${d}</span><span class="sample-tag">Sample</span></div>`).join("")}
          </div>
        </div>

        <div class="info-card">
          <h3>Facilities</h3>
          <div class="fac-grid">
            ${r.facilities.map(f => `<span class="fac-tag">${FACILITY_LABEL[f] || f}</span>`).join("")}
            ${r.diet.vegan ? `<span class="fac-tag">Vegan options</span>` : ""}
            ${r.diet.jain  ? `<span class="fac-tag">Jain food</span>` : ""}
            ${r.diet.halal ? `<span class="fac-tag">Halal options</span>` : ""}
          </div>
        </div>

        <div class="info-card">
          <h3>Address, hours &amp; contact</h3>
          <div class="unverified">
            <strong>Not available for sample listings.</strong>
            Street address, opening hours, phone number and map directions are shown only
            when a verified restaurant data source is connected. They have deliberately not
            been generated for this demonstration.
          </div>
        </div>
      </div>

      <aside>
        <div class="info-card">
          <h3>Why this was recommended</h3>
          <p style="font-size:14px;color:var(--ink-soft);margin:0 0 18px;">
            ${scored ? scored.explanation : "Set your preferences on the home page to see a personalised explanation."}
          </p>
          <div class="score-bars">
            <div class="score-bar">
              <div class="sb-top"><span>Content-based match</span><span>${pct(parts.content)}%</span></div>
              <div class="score-track"><div class="score-fill content" style="width:${pct(parts.content)}%"></div></div>
            </div>
            <div class="score-bar">
              <div class="sb-top"><span>${collabLabel}</span><span>${pct(collabVal)}%</span></div>
              <div class="score-track"><div class="score-fill collab" style="width:${pct(collabVal)}%"></div></div>
            </div>
            <div class="score-bar">
              <div class="sb-top"><span><strong>Hybrid score</strong></span><span>${pct(hybrid)}%</span></div>
              <div class="score-track"><div class="score-fill hybrid" style="width:${pct(hybrid)}%"></div></div>
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-faint);margin:16px 0 0;line-height:1.5;">
            Hybrid = ${WEIGHTS.content} × content + ${WEIGHTS.collaborative} × ${parts.coldStart ? "popularity" : "collaborative"}.
            ${parts.coldStart ? "With no interaction history yet, popularity stands in for the collaborative arm." : ""}
          </p>
        </div>

        <div class="info-card">
          <h3>Your feedback</h3>
          <p style="font-size:13px;color:var(--ink-soft);margin:0 0 14px;">
            Rating this restaurant feeds the collaborative arm and changes what gets recommended next.
          </p>
          <div class="pill-row" id="rate-row" style="margin-bottom:14px;">
            ${[1,2,3,4,5].map(n =>
              `<button class="pill${fb.rating === n ? " on" : ""}" data-rate="${n}">${n} ★</button>`).join("")}
          </div>
          <button class="btn ${fb.fav ? "btn-green" : "btn-ghost"} btn-sm" id="fav-btn" style="width:100%;">
            ${fb.fav ? "❤️ Saved to favourites" : "🤍 Save to favourites"}
          </button>
        </div>
      </aside>
    </div>

    <div style="margin-top:46px;">
      <div class="section-head">
        <div class="section-tag">You might also like</div>
        <h2>Similar restaurants</h2>
        <p>Ranked by a blend of attribute similarity (TF-IDF cosine) and co-rating patterns from the item-item matrix.</p>
      </div>
      <div class="resto-grid" id="similar"></div>
    </div>
  `;

  const similarEl = document.getElementById("similar");
  similarEl.innerHTML = similarTo(r.id, 4).map(s => restaurantCard(s, { explanation:false })).join("");
  wireCardActions(similarEl);

  document.getElementById("rate-row").addEventListener("click", e => {
    const btn = e.target.closest("[data-rate]");
    if (!btn) return;
    const n = Number(btn.dataset.rate);
    const current = Feedback.for(r.id).rating;
    Feedback.set(r.id, { rating: current === n ? undefined : n, liked: n >= 4 });
    renderDetail(r);
  });

  document.getElementById("fav-btn").addEventListener("click", () => {
    Feedback.set(r.id, { fav: !Feedback.for(r.id).fav });
    renderDetail(r);
  });
}
