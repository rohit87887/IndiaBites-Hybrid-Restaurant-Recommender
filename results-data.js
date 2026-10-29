// ─────────────────────────────────────────────────────────────────────────────
// EVALUATION RESULTS
//
// Replace every `null` with the corresponding value from the Colab notebooks.
// A null renders as "—" on the page, so partially-filled tables still work.
// Best value per column is highlighted automatically (lower wins for RMSE/MAE,
// higher wins for everything else).
//
// Metrics are stored as decimals, not percentages: Precision@K of 12.3% → 0.123
// ─────────────────────────────────────────────────────────────────────────────

const RESULTS = {
  // The K used for all @K metrics — update if the notebooks used a different value.
  k: 10,

  datasets: [
    { id: "zomato", label: "Zomato-style dataset" },
    { id: "swiggy", label: "Swiggy-style dataset" },
  ],

  // Lower is better for error metrics; higher is better for ranking metrics.
  metrics: [
    { key: "rmse",      label: "RMSE",         better: "lower"  },
    { key: "mae",       label: "MAE",          better: "lower"  },
    { key: "precision", label: "Precision@K",  better: "higher" },
    { key: "recall",    label: "Recall@K",     better: "higher" },
    { key: "f1",        label: "F1@K",         better: "higher" },
    { key: "ndcg",      label: "NDCG@K",       better: "higher" },
    { key: "coverage",  label: "Coverage",     better: "higher" },
  ],

  // ── Task 1: rating prediction (6 models) ────────────────────────────────
  ratingModels: [
    {
      model: "Global Mean", role: "baseline",
      zomato: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
      swiggy: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
    },
    {
      model: "Popularity", role: "baseline",
      zomato: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
      swiggy: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
    },
    {
      model: "SVD (tuned)", role: "advanced",
      zomato: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
      swiggy: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
    },
    {
      model: "NMF", role: "advanced",
      zomato: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
      swiggy: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
    },
    {
      model: "Item-based KNN", role: "advanced",
      zomato: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
      swiggy: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
    },
    {
      model: "User-based KNN", role: "advanced",
      zomato: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
      swiggy: { rmse: null, mae: null, precision: null, recall: null, f1: null, ndcg: null, coverage: null },
    },
  ],

  // ── Task 2: sentiment classification (3 models) ─────────────────────────
  sentimentMetrics: [
    { key: "accuracy",  label: "Accuracy",  better: "higher" },
    { key: "precision", label: "Precision", better: "higher" },
    { key: "recall",    label: "Recall",    better: "higher" },
    { key: "f1",        label: "F1",        better: "higher" },
  ],

  sentimentModels: [
    { model: "VADER",                   note: "Used in live pipeline", accuracy: null, precision: null, recall: null, f1: null },
    { model: "Multinomial Naive Bayes", note: "Compared",              accuracy: null, precision: null, recall: null, f1: null },
    { model: "Logistic Regression",     note: "Compared",              accuracy: null, precision: null, recall: null, f1: null },
  ],

  // ── Novel contribution: fixed vs. personalized fusion weights ───────────
  // The headline comparison for contribution #1. Reported per dataset because
  // the effect differed between them.
  fusionComparison: [
    { dataset: "Zomato-style", metric: "NDCG@K",      fixed: null, personalized: null },
    { dataset: "Zomato-style", metric: "Precision@K", fixed: null, personalized: null },
    { dataset: "Swiggy-style", metric: "NDCG@K",      fixed: null, personalized: null },
    { dataset: "Swiggy-style", metric: "Precision@K", fixed: null, personalized: null },
  ],
};
