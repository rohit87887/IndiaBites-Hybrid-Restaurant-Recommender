// ─────────────────────────────────────────────────────────────────────────────
// INDIABITES — HYBRID RECOMMENDATION ENGINE
//
//   Hybrid Score = W_CONTENT × ContentScore + W_COLLAB × CollaborativeScore
//
// Content-based arm : TF-IDF over restaurant attribute documents + cosine
//                     similarity against a user-preference query vector.
// Collaborative arm : item-item cosine similarity over a user×item rating
//                     matrix (Sarwar et al., 2001), predicting a score from
//                     the user's own liked/rated items.
// Cold start        : with no interaction history the collaborative arm has
//                     nothing to work from, so the blend falls back to
//                     content-based + popularity until feedback exists.
//
// Both arms are min-max normalised to [0,1] before blending so neither
// dominates purely because of its natural scale.
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = { content: 0.6, collaborative: 0.4 };

// ── Deterministic PRNG so the synthetic interaction matrix is reproducible ──
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONTENT-BASED ARM — TF-IDF + cosine similarity
// ─────────────────────────────────────────────────────────────────────────────

function priceBandToken(cost) {
  if (cost < 200) return "price_budget";
  if (cost < 500) return "price_low";
  if (cost < 1000) return "price_mid";
  if (cost < 2000) return "price_high";
  return "price_premium";
}

// Each restaurant becomes a bag of attribute tokens. Cuisines are repeated so
// they carry more term-frequency weight than facilities or ambience.
function buildDocument(r) {
  const tokens = [];
  r.cuisines.forEach(c => { const t = "cuisine_" + c; tokens.push(t, t, t); });
  r.ambience.forEach(a => tokens.push("ambience_" + a));
  r.facilities.forEach(f => tokens.push("facility_" + f));
  if (r.diet.veg)    tokens.push("diet_veg");
  if (r.diet.nonVeg) tokens.push("diet_nonveg");
  if (r.diet.vegan)  tokens.push("diet_vegan");
  if (r.diet.jain)   tokens.push("diet_jain");
  if (r.diet.halal)  tokens.push("diet_halal");
  tokens.push(priceBandToken(r.cost));
  tokens.push("city_" + r.city);
  tokens.push("locality_" + r.locality);
  return tokens;
}

function termFrequency(tokens) {
  const tf = new Map();
  tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
  // Normalise by document length so long documents aren't unfairly favoured.
  const len = tokens.length || 1;
  tf.forEach((v, k) => tf.set(k, v / len));
  return tf;
}

// Precomputed once at load: IDF across the whole catalogue + per-restaurant
// TF-IDF vectors.
const ContentModel = (() => {
  const docs = RESTAURANTS.map(buildDocument);
  const N = docs.length;

  const df = new Map();
  docs.forEach(tokens => {
    new Set(tokens).forEach(t => df.set(t, (df.get(t) || 0) + 1));
  });

  const idf = new Map();
  df.forEach((count, term) => idf.set(term, Math.log(N / count) + 1));

  const vectors = docs.map(tokens => {
    const tf = termFrequency(tokens);
    const vec = new Map();
    tf.forEach((v, t) => vec.set(t, v * (idf.get(t) || 0)));
    return vec;
  });

  const norms = vectors.map(v => {
    let s = 0; v.forEach(x => { s += x * x; });
    return Math.sqrt(s) || 1;
  });

  return { idf, vectors, norms, index: new Map(RESTAURANTS.map((r, i) => [r.id, i])) };
})();

function cosine(vecA, normA, vecB, normB) {
  let dot = 0;
  // Iterate the smaller map for speed.
  const [small, large] = vecA.size < vecB.size ? [vecA, vecB] : [vecB, vecA];
  small.forEach((val, term) => {
    const other = large.get(term);
    if (other !== undefined) dot += val * other;
  });
  return dot / (normA * normB);
}

// Turn the user's stated preferences into a query document, then into a
// TF-IDF vector in the same space as the restaurants.
function buildPreferenceVector(prefs) {
  const tokens = [];
  (prefs.cuisines || []).forEach(c => { const t = "cuisine_" + c; tokens.push(t, t, t); });
  (prefs.ambience || []).forEach(a => tokens.push("ambience_" + a));
  (prefs.facilities || []).forEach(f => tokens.push("facility_" + f));
  (prefs.diet || []).forEach(d => tokens.push("diet_" + d));
  if (prefs.city) tokens.push("city_" + prefs.city);
  if (prefs.budgetBand) {
    const band = BUDGET_BANDS.find(b => b.id === prefs.budgetBand);
    if (band) tokens.push(priceBandToken((band.min + Math.min(band.max, 3000)) / 2));
  }

  if (tokens.length === 0) return null;

  const tf = termFrequency(tokens);
  const vec = new Map();
  tf.forEach((v, t) => vec.set(t, v * (ContentModel.idf.get(t) || 0)));
  let s = 0; vec.forEach(x => { s += x * x; });
  return { vec, norm: Math.sqrt(s) || 1 };
}

function contentScores(prefs, candidates) {
  const query = buildPreferenceVector(prefs);
  const out = new Map();
  if (!query) { candidates.forEach(r => out.set(r.id, 0)); return out; }

  candidates.forEach(r => {
    const i = ContentModel.index.get(r.id);
    out.set(r.id, cosine(query.vec, query.norm, ContentModel.vectors[i], ContentModel.norms[i]));
  });
  return out;
}

// Similarity between two restaurants, used for "more like this".
function contentSimilarity(idA, idB) {
  const i = ContentModel.index.get(idA), j = ContentModel.index.get(idB);
  if (i === undefined || j === undefined) return 0;
  return cosine(ContentModel.vectors[i], ContentModel.norms[i],
                ContentModel.vectors[j], ContentModel.norms[j]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COLLABORATIVE ARM — synthetic users + item-item cosine similarity
//
// ⚠ The interaction matrix below is SYNTHETIC. Public restaurant catalogues
// carry no per-user rating history, so ~400 users are generated with stable
// cuisine and budget affinities. This mirrors the synthetic fallback layer
// described in the project write-up, and its limitations are reported there.
// ─────────────────────────────────────────────────────────────────────────────

const SYNTHETIC_USERS = 400;

const CollabModel = (() => {
  const rand = mulberry32(20251009);
  const items = RESTAURANTS.length;
  // ratings[u] = Map(itemIndex -> rating 1..5)
  const ratings = [];

  for (let u = 0; u < SYNTHETIC_USERS; u++) {
    // Each synthetic user gets 2–3 preferred cuisines and a budget affinity.
    const prefCount = 2 + Math.floor(rand() * 2);
    const prefs = new Set();
    while (prefs.size < prefCount) prefs.add(CUISINES[Math.floor(rand() * CUISINES.length)]);
    const budgetAffinity = 150 + rand() * 1400;
    const userRatings = new Map();

    // They rate 12–28 restaurants.
    const n = 12 + Math.floor(rand() * 17);
    for (let k = 0; k < n; k++) {
      const i = Math.floor(rand() * items);
      if (userRatings.has(i)) continue;
      const r = RESTAURANTS[i];

      const cuisineMatch = r.cuisines.some(c => prefs.has(c)) ? 1 : 0;
      const budgetGap = Math.abs(r.cost - budgetAffinity) / 1500;
      // Base rating tracks the restaurant's own quality, nudged by personal fit.
      let score = r.rating
        + cuisineMatch * 0.9
        - Math.min(budgetGap, 1) * 0.8
        + (rand() - 0.5) * 0.7;
      score = Math.max(1, Math.min(5, score));
      userRatings.set(i, score);
    }
    ratings.push(userRatings);
  }

  // Mean-centre each item's ratings, then compute item-item cosine similarity.
  const itemVectors = Array.from({ length: items }, () => new Map());
  ratings.forEach((userRatings, u) => {
    userRatings.forEach((val, i) => itemVectors[i].set(u, val));
  });

  const itemMeans = itemVectors.map(v => {
    if (v.size === 0) return 0;
    let s = 0; v.forEach(x => { s += x; });
    return s / v.size;
  });

  const centered = itemVectors.map((v, i) => {
    const c = new Map();
    v.forEach((val, u) => c.set(u, val - itemMeans[i]));
    return c;
  });

  const norms = centered.map(v => {
    let s = 0; v.forEach(x => { s += x * x; });
    return Math.sqrt(s) || 1;
  });

  // Full item-item similarity matrix (60×60 — small enough to precompute).
  const sim = Array.from({ length: items }, () => new Float64Array(items));
  for (let i = 0; i < items; i++) {
    for (let j = i + 1; j < items; j++) {
      let dot = 0;
      const [small, large] = centered[i].size < centered[j].size
        ? [centered[i], centered[j]] : [centered[j], centered[i]];
      small.forEach((val, u) => {
        const other = large.get(u);
        if (other !== undefined) dot += val * other;
      });
      const s = dot / (norms[i] * norms[j]);
      sim[i][j] = s; sim[j][i] = s;
    }
    sim[i][i] = 1;
  }

  // Popularity = review volume scaled by rating, used for cold start.
  const maxReviews = Math.max(...RESTAURANTS.map(r => r.reviews));
  const popularity = RESTAURANTS.map(r =>
    (Math.log(1 + r.reviews) / Math.log(1 + maxReviews)) * (r.rating / 5));

  return { sim, popularity, index: new Map(RESTAURANTS.map((r, i) => [r.id, i])) };
})();

// Predict a collaborative score from the items this user has actually liked
// or rated. Returns null when there's no history — that's the cold-start path.
function collaborativeScores(likedItems, candidates) {
  const out = new Map();
  const liked = (likedItems || []).filter(l => CollabModel.index.has(l.id));
  if (liked.length === 0) return null;

  candidates.forEach(r => {
    const i = CollabModel.index.get(r.id);
    let num = 0, den = 0;
    liked.forEach(l => {
      const j = CollabModel.index.get(l.id);
      if (i === j) return;
      const s = CollabModel.sim[i][j];
      if (s <= 0) return;
      num += s * (l.rating !== undefined ? l.rating : 5);
      den += s;
    });
    out.set(r.id, den === 0 ? 0 : (num / den) / 5);
  });
  return out;
}

function popularityScores(candidates) {
  const out = new Map();
  candidates.forEach(r => out.set(r.id, CollabModel.popularity[CollabModel.index.get(r.id)]));
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FILTERING
// ─────────────────────────────────────────────────────────────────────────────

function applyFilters(filters) {
  const q = (filters.query || "").trim().toLowerCase();

  return RESTAURANTS.filter(r => {
    if (filters.city && r.city !== filters.city) return false;
    if (filters.locality && r.locality !== filters.locality) return false;

    if (q) {
      const hay = [r.name, r.city, r.locality, r.pin, ...r.cuisines].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (filters.cuisines && filters.cuisines.length) {
      if (!r.cuisines.some(c => filters.cuisines.includes(c))) return false;
    }

    if (filters.minRating && r.rating < filters.minRating) return false;

    if (filters.budgetBand) {
      const band = BUDGET_BANDS.find(b => b.id === filters.budgetBand);
      if (band && (r.cost < band.min || r.cost > band.max)) return false;
    }

    const diet = filters.diet || [];
    if (diet.includes("pure-veg") && r.diet.nonVeg) return false;
    if (diet.includes("nonveg")   && !r.diet.nonVeg) return false;
    if (diet.includes("vegan")    && !r.diet.vegan)  return false;
    if (diet.includes("jain")     && !r.diet.jain)   return false;
    if (diet.includes("halal")    && !r.diet.halal)  return false;

    const fac = filters.facilities || [];
    if (fac.length && !fac.every(f => r.facilities.includes(f))) return false;

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. HYBRID SCORING + EXPLANATIONS
// ─────────────────────────────────────────────────────────────────────────────

function normalise(scoreMap) {
  const vals = [...scoreMap.values()];
  if (vals.length === 0) return scoreMap;
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min;
  const out = new Map();
  scoreMap.forEach((v, k) => out.set(k, range === 0 ? (max > 0 ? 1 : 0) : (v - min) / range));
  return out;
}

function buildExplanation(r, parts, prefs) {
  const reasons = [];

  const matched = (prefs.cuisines || []).filter(c => r.cuisines.includes(c));
  if (matched.length) {
    reasons.push(`you prefer ${matched.slice(0, 2).join(" and ")} cuisine`);
  }

  if (prefs.budgetBand) {
    const band = BUDGET_BANDS.find(b => b.id === prefs.budgetBand);
    if (band && r.cost >= band.min && r.cost <= band.max) {
      reasons.push(`it matches your budget of ${band.label.toLowerCase()} per person`);
    }
  }

  if (prefs.city && r.city === prefs.city && r.rating >= 4.2) {
    reasons.push(`it's highly rated in ${r.locality}`);
  } else if (prefs.city && r.city === prefs.city) {
    reasons.push(`it's in your selected city`);
  }

  if (parts.collaborative !== null && parts.collaborative > 0.6) {
    reasons.push(`it's similar to restaurants you previously liked`);
  }

  if (parts.coldStart && r.reviews > 1500) {
    reasons.push(`it's popular with ${r.reviews.toLocaleString("en-IN")} diners rating it ${r.rating}`);
  }

  const diet = prefs.diet || [];
  if (diet.includes("pure-veg") && !r.diet.nonVeg) reasons.push(`it's pure vegetarian`);
  else if (diet.includes("vegan") && r.diet.vegan) reasons.push(`it has vegan options`);
  else if (diet.includes("jain") && r.diet.jain)   reasons.push(`it serves Jain food`);

  if (reasons.length === 0) {
    reasons.push(`it's rated ${r.rating} across ${r.reviews.toLocaleString("en-IN")} reviews`);
  }

  const text = reasons.slice(0, 3).join(", and ");
  return "Recommended because " + text + ".";
}

/**
 * Main entry point.
 * @param {Object} filters  hard filters (city, cuisines, budget, diet, …)
 * @param {Object} prefs    soft preferences driving the content arm
 * @param {Array}  history  [{id, rating}] — liked / rated restaurants
 * @param {Object} opts     { sort, weights }
 */
function recommend(filters, prefs, history, opts = {}) {
  const candidates = applyFilters(filters);
  if (candidates.length === 0) return { results: [], coldStart: false };

  const weights = opts.weights || WEIGHTS;

  const content = normalise(contentScores(prefs, candidates));
  const collabRaw = collaborativeScores(history, candidates);
  const coldStart = collabRaw === null;
  // With no interaction history, popularity stands in for the collaborative arm.
  const collab = normalise(coldStart ? popularityScores(candidates) : collabRaw);

  const scored = candidates.map(r => {
    const c = content.get(r.id) || 0;
    const cf = collab.get(r.id) || 0;
    const hybrid = weights.content * c + weights.collaborative * cf;
    const parts = {
      content: c,
      collaborative: coldStart ? null : cf,
      popularity: coldStart ? cf : null,
      coldStart,
    };
    return {
      ...r,
      score: hybrid,
      parts,
      explanation: buildExplanation(r, parts, prefs),
    };
  });

  const sort = opts.sort || "relevance";
  scored.sort((a, b) => {
    if (sort === "rating")     return b.rating - a.rating;
    if (sort === "popularity") return b.reviews - a.reviews;
    if (sort === "price-low")  return a.cost - b.cost;
    if (sort === "price-high") return b.cost - a.cost;
    return b.score - a.score;
  });

  return { results: scored, coldStart };
}

// "Similar restaurants" on the details page — content similarity, with the
// collaborative signal folded in when the matrix has something to say.
function similarTo(id, limit = 4) {
  const i = CollabModel.index.get(id);
  return RESTAURANTS
    .filter(r => r.id !== id)
    .map(r => {
      const j = CollabModel.index.get(r.id);
      const cf = i !== undefined && j !== undefined ? Math.max(0, CollabModel.sim[i][j]) : 0;
      return { ...r, score: 0.6 * contentSimilarity(id, r.id) + 0.4 * cf };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
