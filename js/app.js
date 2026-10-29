// ─────────────────────────────────────────────────────────────────────────────
// INDIABITES — shared UI layer
// ─────────────────────────────────────────────────────────────────────────────

const CUISINE_STYLE = {
  "South Indian":      { emoji:"🥞", g:["#FFE9C9","#FFD08A"] },
  "North Indian":      { emoji:"🍛", g:["#FFE0C2","#FFB877"] },
  "Chettinad":         { emoji:"🌶️", g:["#FFD9CC","#FF9E7A"] },
  "Tamil":             { emoji:"🍚", g:["#FFF0D4","#FFDB99"] },
  "Andhra":            { emoji:"🔥", g:["#FFD6CC","#FF9980"] },
  "Kerala":            { emoji:"🥥", g:["#D9F2E4","#9BDCBD"] },
  "Bengali":           { emoji:"🐟", g:["#D9ECF7","#9CCDE8"] },
  "Punjabi":           { emoji:"🫓", g:["#FFE7C4","#FFC878"] },
  "Gujarati":          { emoji:"🍲", g:["#FFF3CC","#FFE08A"] },
  "Rajasthani":        { emoji:"👑", g:["#FFE3D1","#FFB38A"] },
  "Mughlai":           { emoji:"🍗", g:["#F0DCC8","#D4AE85"] },
  "Hyderabadi Biryani":{ emoji:"🍝", g:["#FFE5C0","#FFC070"] },
  "Chinese":           { emoji:"🥡", g:["#FFD9D9","#FFA3A3"] },
  "Italian":           { emoji:"🍕", g:["#FFE2D4","#FFB091"] },
  "Mexican":           { emoji:"🌮", g:["#FFEBC7","#FFD180"] },
  "Continental":       { emoji:"🍽️", g:["#E8E4F0","#C0B6DC"] },
  "Street Food":       { emoji:"🥘", g:["#FFE0CC","#FFB080"] },
  "Cafe":              { emoji:"☕", g:["#EADFD3","#C9AE94"] },
  "Desserts":          { emoji:"🍮", g:["#FFE1EC","#FFAECB"] },
};

const styleFor = r => CUISINE_STYLE[r.cuisines[0]] || { emoji:"🍽️", g:["#FFE9C9","#FFD08A"] };

const FACILITY_LABEL = {
  "family":"Family friendly", "dine-in":"Dine-in", "takeaway":"Takeaway",
  "delivery":"Delivery", "outdoor":"Outdoor seating", "cafe":"Café",
  "fine-dining":"Fine dining",
};

const rupees = n => "₹" + n.toLocaleString("en-IN");

// ── Local persistence (per-viewer only; safe if storage is blocked) ───────
const Store = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem("indiabites:" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem("indiabites:" + key, JSON.stringify(value)); } catch {}
  },
};

const Prefs = {
  get()  { return Store.read("prefs", { cuisines:[], city:"", budgetBand:"", diet:[], ambience:[] }); },
  set(p) { Store.write("prefs", p); },
};

const Feedback = {
  // { [id]: { fav:bool, rating:1..5, liked:bool } }
  all()  { return Store.read("feedback", {}); },
  for(id){ return this.all()[id] || {}; },
  set(id, patch) {
    const all = this.all();
    all[id] = { ...(all[id] || {}), ...patch };
    Store.write("feedback", all);
  },
  // Items the collaborative arm can learn from.
  history() {
    const all = this.all();
    return Object.entries(all)
      .filter(([, v]) => v.fav || v.liked || v.rating)
      .map(([id, v]) => ({ id, rating: v.rating || (v.liked === false ? 2 : 5) }));
  },
  favourites() {
    return Object.entries(this.all()).filter(([, v]) => v.fav).map(([id]) => id);
  },
};

const Recent = {
  list() { return Store.read("recent", []); },
  push(id) {
    const list = this.list().filter(x => x !== id);
    list.unshift(id);
    Store.write("recent", list.slice(0, 8));
  },
};

// ── Card rendering ───────────────────────────────────────────────────────
function dietDots(r) {
  const out = [];
  if (r.diet.veg)    out.push(`<span class="diet-dot veg" title="Vegetarian options">●</span>`);
  if (r.diet.nonVeg) out.push(`<span class="diet-dot nonveg" title="Non-vegetarian options">●</span>`);
  return out.join("");
}

function restaurantCard(r, opts = {}) {
  const st = styleFor(r);
  const fb = Feedback.for(r.id);
  const rank = opts.rank ? `<span class="rc-rank">${opts.rank}</span>` : "";
  const why = opts.explanation !== false && r.explanation
    ? `<div class="rc-why">${r.explanation}</div>` : "";

  return `
  <article class="resto-card" data-id="${r.id}">
    <div class="rc-media" style="background:linear-gradient(135deg,${st.g[0]},${st.g[1]})">
      ${rank}
      <button class="rc-fav${fb.fav ? " on" : ""}" data-fav="${r.id}"
              aria-label="Save to favourites" title="Save to favourites">${fb.fav ? "❤️" : "🤍"}</button>
      <span>${st.emoji}</span>
    </div>
    <div class="rc-body">
      <div class="rc-head">
        <h3 class="rc-name">${r.name}</h3>
        <span class="rc-rating">★ ${r.rating.toFixed(1)}</span>
      </div>
      <div class="rc-loc">📍 ${r.locality}, ${r.city}</div>
      <div class="rc-cuisines">${r.cuisines.join(" · ")}</div>
      <p class="rc-desc">${r.desc}</p>
      ${why}
      <div class="rc-meta">
        <span class="rc-cost">${rupees(r.cost)}</span>
        <span>for one</span>
        <span>·</span>
        <span>${r.reviews.toLocaleString("en-IN")} reviews</span>
        <span style="margin-left:auto;display:flex;gap:4px;">${dietDots(r)}</span>
      </div>
      <div class="rc-actions">
        <a class="btn btn-primary btn-sm" href="restaurant.html?id=${r.id}">View details</a>
        <button class="icon-btn${fb.liked === true ? " on" : ""}" data-like="${r.id}"
                title="I like this — improves your recommendations">👍</button>
        <button class="icon-btn" data-dislike="${r.id}" title="Not for me">👎</button>
      </div>
    </div>
  </article>`;
}

// Delegated handlers so cards can be re-rendered freely.
function wireCardActions(root, onChange) {
  root.addEventListener("click", e => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      const id = fav.dataset.fav;
      const now = !Feedback.for(id).fav;
      Feedback.set(id, { fav: now });
      fav.classList.toggle("on", now);
      fav.textContent = now ? "❤️" : "🤍";
      if (onChange) onChange();
      return;
    }
    const like = e.target.closest("[data-like]");
    if (like) {
      const id = like.dataset.like;
      const now = Feedback.for(id).liked !== true;
      Feedback.set(id, { liked: now, rating: now ? 5 : undefined });
      like.classList.toggle("on", now);
      if (onChange) onChange();
      return;
    }
    const dis = e.target.closest("[data-dislike]");
    if (dis) {
      const id = dis.dataset.dislike;
      Feedback.set(id, { liked: false, rating: 2, fav: false });
      if (onChange) onChange();
    }
  });
}

// ── Shared chrome ────────────────────────────────────────────────────────
function navHTML(active) {
  const link = (href, label) =>
    `<a href="${href}"${active === href ? ' class="active"' : ""}>${label}</a>`;
  return `
  <div class="nav-inner">
    <a href="index.html" class="brand"><span class="brand-mark">🍛</span> <span>IndiaBites</span></a>
    <nav class="nav-links">
      ${link("index.html","Home")}
      ${link("explore.html","Explore")}
      ${link("about.html","How It Works")}
      ${link("papers.html","Research")}
    </nav>
  </div>`;
}

function footerHTML() {
  return `
  <div class="wrap">
    <div class="foot-brand">IndiaBites &mdash; Hybrid Restaurant Recommendation System</div>
    <div>Integrated M.Tech Business Analytics &middot; VIT Chennai</div>
    <div class="foot-note">
      All restaurant listings on this site are <strong>sample data created for academic
      demonstration</strong>. Names are fictional and ratings, prices and reviews are
      generated — they do not describe any real business.
    </div>
  </div>`;
}

function mountChrome(active) {
  const nav = document.querySelector("header.site-nav");
  if (nav) nav.innerHTML = navHTML(active);
  const foot = document.querySelector("footer");
  if (foot) foot.innerHTML = footerHTML();
}
