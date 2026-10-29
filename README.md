# IndiaBites

**An Explainable Hybrid Restaurant Recommendation System with Personalised Fusion Weights**

> ⚠️ **All Rights Reserved — not open source.** This repository is published for academic
> evaluation only. No permission is granted to use, copy, modify or redistribute any part
> of it. See [LICENSE](LICENSE).

| | |
|---|---|
| **Course** | CSE4077 – Recommender Systems |
| **Programme** | M.Tech Integrated CSE (Business Analytics) |
| **Institution** | Vellore Institute of Technology, Chennai |
| **Faculty Mentor** | Dr S Vigneshwari |
| **Authors** | E Bharathvikraman (23MIA1059) · JB Dinesh Kumar (23MIA1126) · S Rohit (23MIA1175) |

---

## ⚠️ Sample data notice

**Every restaurant in this project is fictional.** Names, ratings, prices, review counts
and review text are generated for academic demonstration and describe no real business.
Street addresses, phone numbers, opening hours and map coordinates were deliberately
**not** generated — the interface shows an explicit "available only with verified data"
state instead of fabricating them.

The per-user interaction data used in the evaluation is likewise **synthetic**, because
public restaurant catalogues expose aggregate statistics only and carry no per-user rating
history. The reported figures therefore establish that the pipeline is internally correct
and that the models rank relative to one another as the literature predicts — they are
**not** estimates of real-world performance.

---

## What this is

Most restaurant recommenders lean on a single signal, and each choice fails in a
characteristic way: collaborative filtering is mathematically undefined for a new user,
content-based filtering overspecialises, and a star rating discards what the review text
actually says. IndiaBites fuses all three into one ranking, and adds two things beyond a
textbook hybrid:

1. **Personalised fusion weights.** Instead of one fixed blend applied to everyone, each
   user's weights are estimated from their own rating history by Non-Negative Least
   Squares. The non-negativity constraint matters: a negative coefficient would mean a
   *better* match lowers predicted preference, which is neither interpretable nor
   compatible with the explanations.
2. **An explainability layer.** Every recommendation states its reasoning in plain English.
   Cold-start suggestions say explicitly that they rest on popularity rather than
   personalised evidence, so the user is never misled about the basis.

It also respects constraints that are mandatory in the Indian market rather than optional:
dietary observance (vegetarian / Jain / halal / vegan) as a hard filter, a price range
spanning two orders of magnitude, and nineteen distinct regional cuisines rather than one
"Indian" label.

---

## Running the web application

No build step and no server framework — the TF-IDF index, the item–item similarity matrix
and the hybrid scoring all run in the browser.

```bash
python -m http.server 8842
```

Then open <http://localhost:8842>. Opening `index.html` directly from disk also works.

| Page | Purpose |
|---|---|
| `index.html` | Home — search, cuisine browse, taste profile, recommendations |
| `explore.html` | Full filtering (city, cuisine, budget, diet, facilities) and ranking |
| `restaurant.html` | Detail view with the hybrid score broken into its components |
| `about.html` | Methodology, models, evaluation results |
| `papers.html` | Literature review, searchable and filterable by theme |

---

## Reproducing the evaluation

```bash
pip install numpy scipy scikit-learn nltk
python -c "import nltk; nltk.download('vader_lexicon')"
python experiment.py
```

This regenerates `results.json` exactly — all random seeds are fixed. The run trains nine
models across two generated datasets and evaluates seven metrics at K = 10.

**Models.** Rating prediction: Global Mean, Popularity, biased matrix factorisation (SGD),
NMF, item-based KNN, user-based KNN. Sentiment: VADER, Multinomial Naïve Bayes, Logistic
Regression.

**Metrics.** RMSE, MAE, Precision@10, Recall@10, F1@10, NDCG@10, Coverage.

### Headline findings

- **Error and ranking metrics diverged.** On Dataset I, matrix factorisation achieved the
  best RMSE (0.5364) but the *Popularity baseline* produced the better ranking (NDCG@10
  0.0257 vs 0.0193). This reproduces the effect documented by Cremonesi et al. (2010), and
  is why both metric families are reported rather than one.
- **It did not reproduce on Dataset II**, where matrix factorisation led on both families.
  The effect is dataset-dependent, so a single-dataset claim would have been unsafe.
- **Personalised weighting helped unevenly** — +21.3% NDCG@10 on Dataset II, +3.7% on
  Dataset I. Reported as observed rather than selectively.
- **A negative result in the ablation.** On Dataset I the fixed-weight three-signal hybrid
  was beaten by three of its own two-signal subsets. The cause is traceable: the fixed
  blend grants sentiment 0.200 where the learned weights assign it 0.054.
- **Both supervised sentiment classifiers scored exactly 1.0000** — reported as diagnostic
  evidence that the generated review text is trivially separable, *not* as a success.

---

## Repository structure

```
.
├── index.html  explore.html  restaurant.html  about.html  papers.html
├── styles.css
├── js/
│   ├── recommender.js      TF-IDF, item–item CF, hybrid scoring, explanations
│   ├── app.js              shared UI layer and local persistence
│   ├── home.js  explore.js  restaurant.js  papers.js  results.js
├── data/restaurants.js     sample catalogue (fictional)
├── experiment.py           evaluation pipeline
├── results.json            measured output of experiment.py
├── results-data.js         results rendered on the About page
├── papers-data.js          literature review entries
├── Figures/                screenshots used in the report
├── README-DATA.md          how to swap in a real dataset
└── LICENSE                 All Rights Reserved
```

### Documents

| File | Description |
|---|---|
| `IndiaBites_Project_Report_Thesis_Format.docx` | Project report (VIT thesis format) |
| `IndiaBites_Project_Report_v2_WithResults.docx` | Project report (J-Component format) |
| `IndiaBites_Research_Paper.docx` | Research paper draft |
| `IndiaBites_Presentation.pptx` | 6-slide presentation |

---

## Swapping in a real dataset

See [README-DATA.md](README-DATA.md) for the required record shape, the Kaggle column
mapping (note: `approx_cost_for_two` must be **halved** — this project stores cost per
person), and exactly which sample-data labels to remove once verified data is in place.

---

## Licence

**All Rights Reserved.** This is not open-source software. See [LICENSE](LICENSE) for the
full terms. Submitting any part of this work as your own to an educational institution is
plagiarism.
