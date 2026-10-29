"""
IndiaBites - evaluation pipeline
Implements exactly the protocol described in Section 3 of the project report:
  6 rating-prediction models + 3 sentiment classifiers, 7 metrics, 2 datasets,
  fixed vs per-user NNLS fusion weights, and an 8-configuration ablation.

The interaction layer is SYNTHETIC (public restaurant catalogues carry no
per-user rating history). Every figure below is a real measurement of this
pipeline on that synthetic data - nothing is estimated or hand-written.
Seeds are fixed so the run is exactly reproducible.
"""
import json, re, numpy as np
from scipy.optimize import nnls
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from nltk.sentiment.vader import SentimentIntensityAnalyzer

K = 10                      # cut-off for @K metrics
REL = 4.0                   # relevance threshold
CUISINES = ["South Indian","North Indian","Chettinad","Tamil","Andhra","Kerala","Bengali",
            "Punjabi","Gujarati","Rajasthani","Mughlai","Hyderabadi Biryani","Chinese",
            "Italian","Mexican","Continental","Street Food","Cafe","Desserts"]

# ───────────────────────── synthetic catalogue + ratings ─────────────────
def make_dataset(n_items, n_users, rmin, rmax, seed):
    rng = np.random.default_rng(seed)
    item_cui = [set(rng.choice(len(CUISINES), size=rng.integers(1, 3), replace=False))
                for _ in range(n_items)]
    item_cost = rng.integers(120, 2200, n_items).astype(float)
    item_q = np.clip(rng.normal(3.9, 0.45, n_items), 2.2, 4.9)      # intrinsic quality

    user_cui = [set(rng.choice(len(CUISINES), size=rng.integers(2, 4), replace=False))
                for _ in range(n_users)]
    user_budget = rng.uniform(150, 1600, n_users)

    rows, cols, vals = [], [], []
    for u in range(n_users):
        n = rng.integers(rmin, rmax)
        items = rng.choice(n_items, size=min(n, n_items), replace=False)
        for i in items:
            match = 1.0 if (item_cui[i] & user_cui[u]) else 0.0
            gap = min(abs(item_cost[i] - user_budget[u]) / 1500.0, 1.0)
            r = item_q[i] + 0.9 * match - 0.8 * gap + rng.normal(0, 0.35)
            rows.append(u); cols.append(i); vals.append(float(np.clip(r, 1, 5)))
    return (np.array(rows), np.array(cols), np.array(vals),
            n_users, n_items, item_cost, item_cui, user_cui, user_budget)


def split(rows, cols, vals, n_users, seed):
    """Per-user 80/20 split; users with <5 ratings stay wholly in train."""
    rng = np.random.default_rng(seed)
    tr, te = [], []
    for u in range(n_users):
        idx = np.where(rows == u)[0]
        if len(idx) < 5:
            tr.extend(idx); continue
        rng.shuffle(idx)
        cut = int(round(0.8 * len(idx)))
        tr.extend(idx[:cut]); te.extend(idx[cut:])
    return np.array(tr), np.array(te)


def to_matrix(rows, cols, vals, n_users, n_items):
    R = np.full((n_users, n_items), np.nan)
    R[rows, cols] = vals
    return R

# ───────────────────────── rating-prediction models ──────────────────────
def m_global_mean(R):
    mu = np.nanmean(R)
    return np.full(R.shape, mu)

def m_popularity(R):
    """Item mean shrunk toward the global mean by support (popularity ranks items
    by how many people rated them and how well)."""
    mu = np.nanmean(R)
    cnt = np.sum(~np.isnan(R), axis=0)
    s = np.nansum(np.nan_to_num(R), axis=0)
    item_mean = np.where(cnt > 0, (s + 12 * mu) / (cnt + 12), mu)
    return np.tile(item_mean, (R.shape[0], 1))

def m_biased_mf(R, f=12, epochs=40, lr=0.008, reg=0.06, seed=7):
    """Regularised matrix factorisation with bias terms, SGD (Koren et al. 2009)."""
    rng = np.random.default_rng(seed)
    nu, ni = R.shape
    mask = ~np.isnan(R)
    ru, ri = np.where(mask)
    rv = R[ru, ri]
    mu = rv.mean()
    bu = np.zeros(nu); bi = np.zeros(ni)
    P = rng.normal(0, 0.05, (nu, f)); Q = rng.normal(0, 0.05, (ni, f))
    order = np.arange(len(rv))
    for _ in range(epochs):
        rng.shuffle(order)
        for n in order:
            u, i, r = ru[n], ri[n], rv[n]
            pred = mu + bu[u] + bi[i] + P[u] @ Q[i]
            e = r - pred
            bu[u] += lr * (e - reg * bu[u])
            bi[i] += lr * (e - reg * bi[i])
            pu = P[u].copy()
            P[u] += lr * (e * Q[i] - reg * P[u])
            Q[i] += lr * (e * pu - reg * Q[i])
    return mu + bu[:, None] + bi[None, :] + P @ Q.T

def m_nmf(R, k=12, seed=7):
    mu = np.nanmean(R)
    F = np.where(np.isnan(R), mu, R)
    model = NMF(n_components=k, init='nndsvda', max_iter=400, random_state=seed)
    Wm = model.fit_transform(F)
    return Wm @ model.components_

def _cos(X):
    n = np.linalg.norm(X, axis=1, keepdims=True); n[n == 0] = 1
    Xn = X / n
    S = Xn @ Xn.T
    np.fill_diagonal(S, 0.0)
    return S

def m_item_knn(R, k=30):
    mu = np.nanmean(R)
    mask = ~np.isnan(R)
    item_mean = np.where(mask.sum(0) > 0, np.nansum(np.nan_to_num(R), 0) / np.maximum(mask.sum(0), 1), mu)
    C = np.where(mask, R - item_mean[None, :], 0.0)
    S = _cos(C.T)
    # keep top-k neighbours per item
    for i in range(S.shape[0]):
        if S.shape[0] > k:
            drop = np.argsort(-np.abs(S[i]))[k:]
            S[i, drop] = 0.0
    num = C @ S.T
    den = np.abs(np.where(mask, 1.0, 0.0) @ np.abs(S).T)
    return item_mean[None, :] + np.divide(num, den, out=np.zeros_like(num), where=den > 1e-9)

def m_user_knn(R, k=30):
    mu = np.nanmean(R)
    mask = ~np.isnan(R)
    user_mean = np.where(mask.sum(1) > 0, np.nansum(np.nan_to_num(R), 1) / np.maximum(mask.sum(1), 1), mu)
    C = np.where(mask, R - user_mean[:, None], 0.0)
    S = _cos(C)
    for u in range(S.shape[0]):
        if S.shape[0] > k:
            drop = np.argsort(-np.abs(S[u]))[k:]
            S[u, drop] = 0.0
    num = S @ C
    den = np.abs(np.abs(S) @ np.where(mask, 1.0, 0.0))
    return user_mean[:, None] + np.divide(num, den, out=np.zeros_like(num), where=den > 1e-9)

# ───────────────────────── metrics ───────────────────────────────────────
def rank_metrics(P, Rtr, Rte, k=K):
    """Precision/Recall/F1/NDCG @k and catalogue coverage."""
    nu, ni = P.shape
    precs, recs, ndcgs = [], [], []
    seen = set()
    idcg_cache = {}
    for u in range(nu):
        test_idx = np.where(~np.isnan(Rte[u]))[0]
        if len(test_idx) == 0:
            continue
        relevant = set(test_idx[Rte[u][test_idx] >= REL].tolist())
        scores = P[u].copy()
        scores[~np.isnan(Rtr[u])] = -np.inf           # exclude training items
        top = np.argsort(-scores)[:k]
        seen.update(top.tolist())
        if not relevant:
            continue
        hits = [1 if i in relevant else 0 for i in top]
        precs.append(sum(hits) / k)
        recs.append(sum(hits) / len(relevant))
        dcg = sum((2 ** h - 1) / np.log2(r + 2) for r, h in enumerate(hits))
        nrel = min(len(relevant), k)
        if nrel not in idcg_cache:
            idcg_cache[nrel] = sum(1 / np.log2(r + 2) for r in range(nrel))
        ndcgs.append(dcg / idcg_cache[nrel] if idcg_cache[nrel] > 0 else 0.0)
    p, r = float(np.mean(precs)), float(np.mean(recs))
    f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0.0
    return p, r, f1, float(np.mean(ndcgs)), len(seen) / ni

def err_metrics(P, Rte):
    m = ~np.isnan(Rte)
    d = P[m] - Rte[m]
    return float(np.sqrt(np.mean(d ** 2))), float(np.mean(np.abs(d)))

# ───────────────────────── sentiment corpus ──────────────────────────────
POS = ["the dosa was crisp and the chutney fresh","service was quick and the staff friendly",
       "excellent flavours and generous portions","filter coffee here is genuinely the best nearby",
       "consistently good food at a fair price","loved the ambience and the biryani was fragrant",
       "warm service and spotless tables","the thali was abundant and every item tasted fresh"]
NEG = ["the food arrived cold and bland","waited forty minutes for a simple order",
       "overpriced for what is served","the curry was oily and poorly spiced",
       "staff were inattentive and the table was dirty","portions have shrunk and quality has dropped",
       "disappointing biryani with dry meat","noisy, cramped and the order came out wrong"]
HEDGE = ["though the location is convenient","but the parking is difficult",
         "and the menu is extensive","although it was crowded",""]

def make_reviews(vals, seed):
    rng = np.random.default_rng(seed)
    texts, labels = [], []
    for r in vals:
        pos = r >= REL
        pool = POS if pos else NEG
        t = rng.choice(pool)
        if rng.random() < 0.35:
            t = t + ", " + rng.choice(HEDGE)
        texts.append(t.strip().strip(","))
        labels.append(1 if pos else 0)
    return texts, np.array(labels)

def sentiment_eval(texts, y, seed=7):
    rng = np.random.default_rng(seed)
    idx = rng.permutation(len(texts))
    cut = int(0.8 * len(idx))
    tr, te = idx[:cut], idx[cut:]
    Xtr = [texts[i] for i in tr]; Xte = [texts[i] for i in te]
    ytr, yte = y[tr], y[te]

    sia = SentimentIntensityAnalyzer()
    vp = np.array([1 if sia.polarity_scores(t)['compound'] >= 0.05 else 0 for t in Xte])

    vec = CountVectorizer(ngram_range=(1, 2), min_df=1)
    A = vec.fit_transform(Xtr); B = vec.transform(Xte)
    mnb = MultinomialNB().fit(A, ytr); mp = mnb.predict(B)
    lr = LogisticRegression(max_iter=1000).fit(A, ytr); lp = lr.predict(B)

    def row(p):
        return dict(accuracy=accuracy_score(yte, p),
                    precision=precision_score(yte, p, zero_division=0),
                    recall=recall_score(yte, p, zero_division=0),
                    f1=f1_score(yte, p, zero_division=0))
    return {"VADER": row(vp), "MNB": row(mp), "LogReg": row(lp)}

# ───────────────────────── content signal + fusion ───────────────────────
def content_scores(n_users, n_items, item_cui, item_cost, user_cui, user_budget):
    """TF-IDF-weighted cuisine match + budget proximity, in [0,1]."""
    df = np.zeros(len(CUISINES))
    for s in item_cui:
        for c in s:
            df[c] += 1
    idf = np.log(len(item_cui) / np.maximum(df, 1)) + 1.0
    S = np.zeros((n_users, n_items))
    for u in range(n_users):
        uc = user_cui[u]
        w_u = np.sqrt(sum(idf[c] ** 2 for c in uc)) or 1.0
        for i in range(n_items):
            ic = item_cui[i]
            inter = uc & ic
            dot = sum(idf[c] ** 2 for c in inter)
            w_i = np.sqrt(sum(idf[c] ** 2 for c in ic)) or 1.0
            cos = dot / (w_u * w_i)
            budget = 1.0 - min(abs(item_cost[i] - user_budget[u]) / 1500.0, 1.0)
            S[u, i] = 0.75 * cos + 0.25 * budget
    return S

def mm(x):
    lo, hi = np.nanmin(x), np.nanmax(x)
    return np.zeros_like(x) if hi - lo < 1e-12 else (x - lo) / (hi - lo)

def fuse_eval(Scon, Scol, Ssen, Rtr, Rte, weights=None, theta=8):
    """weights=None -> per-user NNLS; else fixed 3-vector."""
    nu, ni = Scon.shape
    P = np.zeros((nu, ni))
    learned = []
    for u in range(nu):
        a = mm(Scon[u]); b = mm(Scol[u]); c = mm(Ssen[u])
        if weights is None:
            tr_idx = np.where(~np.isnan(Rtr[u]))[0]
            if len(tr_idx) >= theta:
                A = np.column_stack([a[tr_idx], b[tr_idx], c[tr_idx]])
                t = (Rtr[u][tr_idx] - 1.0) / 4.0
                w, _ = nnls(A, t)
                w = w / w.sum() if w.sum() > 1e-9 else np.array([0.5, 0.3, 0.2])
            else:
                w = np.array([0.5, 0.3, 0.2])
            learned.append(w)
        else:
            w = weights
        P[u] = w[0] * a + w[1] * b + w[2] * c
    return P, (np.array(learned) if learned else None)

# ───────────────────────── run one dataset ───────────────────────────────
def run(name, n_items, n_users, rmin, rmax, seed):
    rows, cols, vals, nu, ni, cost, icui, ucui, ubud = make_dataset(n_items, n_users, rmin, rmax, seed)
    tr, te = split(rows, cols, vals, nu, seed + 1)
    Rtr = to_matrix(rows[tr], cols[tr], vals[tr], nu, ni)
    Rte = to_matrix(rows[te], cols[te], vals[te], nu, ni)
    density = len(vals) / (nu * ni)

    models = {
        "Global Mean":    m_global_mean(Rtr),
        "Popularity":     m_popularity(Rtr),
        "SVD (tuned)":    m_biased_mf(Rtr),
        "NMF":            m_nmf(Rtr),
        "Item-based KNN": m_item_knn(Rtr),
        "User-based KNN": m_user_knn(Rtr),
    }
    table = {}
    for mname, P in models.items():
        rmse, mae = err_metrics(P, Rte)
        p, r, f1, nd, cov = rank_metrics(P, Rtr, Rte)
        table[mname] = dict(rmse=rmse, mae=mae, precision=p, recall=r, f1=f1, ndcg=nd, coverage=cov)

    # ---- fusion: content / collaborative / sentiment signals ----
    Scon = content_scores(nu, ni, icui, cost, ucui, ubud)
    Scol = models["SVD (tuned)"]
    sia = SentimentIntensityAnalyzer()
    pos_rate = np.zeros(ni)
    cnt = np.zeros(ni)
    tx, _ = make_reviews(vals[tr], seed + 2)
    for n, i in enumerate(cols[tr]):
        pos_rate[i] += sia.polarity_scores(tx[n])['compound']
        cnt[i] += 1
    sent_item = np.where(cnt > 0, (pos_rate / np.maximum(cnt, 1) + 1) / 2, 0.5)
    Ssen = np.tile(sent_item, (nu, 1))

    Pfix, _ = fuse_eval(Scon, Scol, Ssen, Rtr, Rte, weights=np.array([0.5, 0.3, 0.2]))
    fp, fr, ff, fn, fc = rank_metrics(Pfix, Rtr, Rte)
    Pnn, learned = fuse_eval(Scon, Scol, Ssen, Rtr, Rte, weights=None)
    np_, nr, nf, nn_, nc = rank_metrics(Pnn, Rtr, Rte)

    fusion = dict(fixed=dict(ndcg=fn, precision=fp), nnls=dict(ndcg=nn_, precision=np_),
                  weight_mean=learned.mean(0).tolist(), weight_std=learned.std(0).tolist(),
                  n_personalised=int(len(learned)))

    # ---- ablation ----
    Z = np.zeros_like(Scon)
    abl = {}
    for label, w, sigs in [
        ("Content only",              np.array([1, 0, 0]), (Scon, Z, Z)),
        ("Collaborative only",        np.array([0, 1, 0]), (Z, Scol, Z)),
        ("Sentiment only",            np.array([0, 0, 1]), (Z, Z, Ssen)),
        ("Content + Collaborative",   np.array([0.6, 0.4, 0]), (Scon, Scol, Z)),
        ("Content + Sentiment",       np.array([0.7, 0, 0.3]), (Scon, Z, Ssen)),
        ("Collaborative + Sentiment", np.array([0, 0.7, 0.3]), (Z, Scol, Ssen)),
        ("Full hybrid (fixed)",       np.array([0.5, 0.3, 0.2]), (Scon, Scol, Ssen)),
    ]:
        Pa, _ = fuse_eval(sigs[0], sigs[1], sigs[2], Rtr, Rte, weights=w)
        pa, _, _, na, _ = rank_metrics(Pa, Rtr, Rte)
        abl[label] = dict(ndcg=na, precision=pa)
    abl["Full hybrid (NNLS)"] = dict(ndcg=nn_, precision=np_)

    texts, y = make_reviews(vals, seed + 3)
    sent = sentiment_eval(texts, y)

    return dict(name=name, n_users=nu, n_items=ni, n_ratings=int(len(vals)),
                density=density, n_train=int(len(tr)), n_test=int(len(te)),
                models=table, fusion=fusion, ablation=abl, sentiment=sent)


if __name__ == "__main__":
    out = {
        "K": K, "relevance_threshold": REL,
        "datasets": [
            run("Dataset I (Zomato-family)",  600, 400, 14, 30, seed=20251028),
            run("Dataset II (Swiggy-family)", 450, 320, 10, 22, seed=77001),
        ],
    }
    with open("results.json", "w", encoding="utf8") as f:
        json.dump(out, f, indent=2)
    for d in out["datasets"]:
        print(f"\n=== {d['name']} ===")
        print(f"users={d['n_users']} items={d['n_items']} ratings={d['n_ratings']} "
              f"density={d['density']*100:.2f}% train={d['n_train']} test={d['n_test']}")
        print(f"{'model':16} {'RMSE':>7} {'MAE':>7} {'P@10':>7} {'R@10':>7} {'F1@10':>7} {'NDCG':>7} {'Cov':>7}")
        for m, v in d["models"].items():
            print(f"{m:16} {v['rmse']:7.4f} {v['mae']:7.4f} {v['precision']:7.4f} "
                  f"{v['recall']:7.4f} {v['f1']:7.4f} {v['ndcg']:7.4f} {v['coverage']:7.4f}")
        fu = d["fusion"]
        print(f"fusion  fixed NDCG={fu['fixed']['ndcg']:.4f} P={fu['fixed']['precision']:.4f} | "
              f"NNLS NDCG={fu['nnls']['ndcg']:.4f} P={fu['nnls']['precision']:.4f}")
        print(f"learned weights mean={np.round(fu['weight_mean'],3).tolist()} "
              f"std={np.round(fu['weight_std'],3).tolist()} n={fu['n_personalised']}")
        print("sentiment:", {k: round(v['accuracy'], 4) for k, v in d["sentiment"].items()})
    print("\nwrote results.json")
