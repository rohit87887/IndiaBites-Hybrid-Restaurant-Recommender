// ─────────────────────────────────────────────────────────────────────────────
// LITERATURE REVIEW DATA
//
// Note: every entry except Asani (2021) and Darraz (2025) is a canonical
// reference for a technique this project uses, assembled to match the project's
// design rather than transcribed from the 19-page review document. Confirm each
// citation's details at the source, and swap out any paper not actually
// reviewed. Darraz et al.'s venue is still a placeholder.
//
// themes: "Collaborative Filtering", "Content-Based", "Sentiment Analysis",
//   "Hybrid", "Deep Learning", "Evaluation", "Explainability", "Optimization"
// ─────────────────────────────────────────────────────────────────────────────

const PAPERS = [
  {
    status: "filled",
    title: "Hybrid Recommender Systems: Survey and Experiments",
    authors: "Burke, R.",
    venue: "User Modeling and User-Adapted Interaction, 12(4)",
    year: 2002,
    themes: ["Hybrid"],
    summary: "The foundational taxonomy of hybrid recommenders, classifying seven ways to combine recommendation techniques — weighted, switching, mixed, feature combination, cascade, feature augmentation, and meta-level — and testing them experimentally.",
    relevance: "Defines the vocabulary this project uses to describe itself. The architecture here is a weighted hybrid, which Burke identifies as the simplest combination strategy; the personalized NNLS weighting is what lifts it above a plain fixed-weight blend."
  },
  {
    status: "filled",
    title: "Item-based collaborative filtering recommendation algorithms",
    authors: "Sarwar, B., Karypis, G., Konstan, J., & Riedl, J.",
    venue: "Proceedings of the 10th International Conference on World Wide Web (WWW '01)",
    year: 2001,
    themes: ["Collaborative Filtering"],
    summary: "Introduces item-based collaborative filtering, computing similarity between items rather than users, and shows it produces better quality than user-based CF while scaling far more efficiently on sparse rating matrices.",
    relevance: "The direct basis for the Item-based KNN model trained here, and the reason both item-based and user-based KNN are evaluated as a pair — this paper is the source of the claim that the item-based direction usually wins, which this project tests on its own two datasets."
  },
  {
    status: "filled",
    title: "Matrix Factorization Techniques for Recommender Systems",
    authors: "Koren, Y., Bell, R., & Volinsky, C.",
    venue: "IEEE Computer, 42(8)",
    year: 2009,
    themes: ["Collaborative Filtering"],
    summary: "The Netflix Prize-era account of why latent factor models beat neighborhood methods: matrix factorization with regularization and bias terms, trained by stochastic gradient descent or ALS, learns compact user and item representations from sparse data.",
    relevance: "Underpins the hyperparameter-tuned SVD model, which is the strongest rating predictor in this project's lineup. Also the source of the bias-term framing that explains why a well-tuned Global Mean baseline is harder to beat than it first appears."
  },
  {
    status: "filled",
    title: "Algorithms for Non-negative Matrix Factorization",
    authors: "Lee, D. D., & Seung, H. S.",
    venue: "Advances in Neural Information Processing Systems (NIPS) 13",
    year: 2001,
    themes: ["Collaborative Filtering", "Optimization"],
    summary: "Derives the multiplicative update rules for non-negative matrix factorization and proves their convergence, producing parts-based, strictly non-negative latent factors rather than the signed factors of unconstrained SVD.",
    relevance: "The basis for the NMF model evaluated here. The non-negativity constraint matters for interpretability — factors can be read as additive taste components — which connects directly to the explainability goals of this project."
  },
  {
    status: "filled",
    title: "Content-Based Recommendation Systems",
    authors: "Pazzani, M. J., & Billsus, D.",
    venue: "The Adaptive Web, Springer LNCS 4321",
    year: 2007,
    themes: ["Content-Based"],
    summary: "A survey of content-based recommendation: representing items by their attributes, building user profiles from previously liked items, and the classifiers used to match the two. Also catalogues the approach's known limits — overspecialization and limited serendipity.",
    relevance: "Justifies the content-based arm built on cuisine, price, and location attributes, and explains why it cannot stand alone. Its overspecialization critique is precisely the weakness the collaborative and sentiment signals are fused in to offset."
  },
  {
    status: "filled",
    title: "VADER: A Parsimonious Rule-Based Model for Sentiment Analysis of Social Media Text",
    authors: "Hutto, C. J., & Gilbert, E.",
    venue: "Proceedings of the Eighth International AAAI Conference on Weblogs and Social Media (ICWSM)",
    year: 2014,
    themes: ["Sentiment Analysis"],
    summary: "A rule-based, lexicon-driven sentiment model tuned for short informal text, handling negation, intensifiers, punctuation, and capitalisation. Requires no training data and runs in constant time, yet matches or beats trained classifiers on social media text.",
    relevance: "The sentiment engine actually deployed in this project's live pipeline. Its no-training-required property is what makes the sentiment arm reproducible on free compute — and its lexicon basis is why the synthetic review layer inflates its apparent accuracy, a limitation reported openly in the findings."
  },
  {
    status: "filled",
    title: "Hidden factors and hidden topics: understanding rating dimensions with review text",
    authors: "McAuley, J., & Leskovec, J.",
    venue: "Proceedings of the 7th ACM Conference on Recommender Systems (RecSys '13)",
    year: 2013,
    themes: ["Sentiment Analysis", "Collaborative Filtering"],
    summary: "Combines latent rating factors with latent review topics in a single model (HFT), showing that review text carries signal the star rating alone does not, and that jointly modelling both improves prediction — especially for users and items with few ratings.",
    relevance: "The empirical case for why a sentiment arm is worth adding at all. It establishes that review text is complementary rather than redundant to ratings, which is the core premise of fusing a third signal in this project."
  },
  {
    status: "filled",
    title: "Restaurant recommender system based on sentiment analysis",
    authors: "Asani, E., Vahdat-Nejad, H., & Sadri, J.",
    venue: "Machine Learning with Applications",
    year: 2021,
    themes: ["Hybrid", "Sentiment Analysis", "Content-Based"],
    summary: "Builds a restaurant recommender that extracts food preferences from the text of user reviews using sentiment analysis, then clusters those preferences to match users with restaurants. Establishes the collaborative + content + sentiment hybrid structure as a workable architecture for the restaurant domain specifically, rather than for generic items.",
    relevance: "This is the closest antecedent to the present project and the source of its core architecture. The project follows the same three-signal structure, and is explicit that this is not where its novelty lies — the contribution sits in the personalized NNLS fusion weights and the explainability layer built on top."
  },
  {
    status: "filled",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K.",
    venue: "Proceedings of NAACL-HLT 2019",
    year: 2019,
    themes: ["Deep Learning", "Sentiment Analysis"],
    summary: "Introduces bidirectional transformer pre-training with masked language modelling, producing contextual word representations that substantially advanced the state of the art across NLP tasks including sentiment classification.",
    relevance: "Context for the comparison this project draws with Darraz et al. BERT-class models set the accuracy ceiling for the sentiment arm, but require GPU fine-tuning per dataset — the specific cost this project declines to pay in exchange for reproducibility across two datasets and nine models."
  },
  {
    status: "filled",
    title: "BERT-based sentiment analysis for restaurant recommendation",
    authors: "Darraz, N., et al.",
    venue: "— complete citation from review document —",
    year: 2025,
    themes: ["Sentiment Analysis", "Deep Learning", "Hybrid"],
    summary: "Applies transformer-based (BERT) sentiment modelling to the recommendation pipeline, achieving a higher accuracy ceiling than classical lexicon and bag-of-words approaches, evaluated on a single dataset.",
    relevance: "Represents the current state of the art this project deliberately does not try to match. The tradeoff is stated openly: BERT brings a higher accuracy ceiling at substantially greater compute cost, while this project opts for classical models that stay fully reproducible on free Colab compute and can therefore afford a much broader evaluation — two datasets, nine models, seven metrics."
  },
  {
    status: "filled",
    title: "Evaluating collaborative filtering recommender systems",
    authors: "Herlocker, J. L., Konstan, J. A., Terveen, L. G., & Riedl, J. T.",
    venue: "ACM Transactions on Information Systems (TOIS), 22(1)",
    year: 2004,
    themes: ["Evaluation", "Collaborative Filtering"],
    summary: "The standard reference on how to evaluate recommenders: distinguishes accuracy, coverage, novelty and serendipity, warns that no single metric captures recommendation quality, and argues metrics must be matched to the user task being supported.",
    relevance: "The methodological basis for this project's seven-metric evaluation, and specifically for reporting Coverage alongside accuracy. Its central warning — that one metric misleads — is what the Popularity-beats-SVD finding here demonstrates in practice."
  },
  {
    status: "filled",
    title: "Performance of recommender algorithms on top-N recommendation tasks",
    authors: "Cremonesi, P., Koren, Y., & Turrin, R.",
    venue: "Proceedings of the 4th ACM Conference on Recommender Systems (RecSys '10)",
    year: 2010,
    themes: ["Evaluation", "Collaborative Filtering"],
    summary: "Demonstrates that error metrics such as RMSE and the quality of a top-N ranked list are only loosely related — algorithms that win on RMSE can lose badly on ranking metrics, and a plain popularity baseline is far stronger on top-N tasks than its error scores suggest.",
    relevance: "The single most important paper for interpreting this project's headline anomaly. It is the published precedent showing the Popularity baseline outperforming sophisticated models on error metrics is a known, explainable effect rather than a bug — and the reason Precision@K and NDCG@K are reported alongside RMSE here."
  },
  {
    status: "filled",
    title: "Cumulated gain-based evaluation of IR techniques",
    authors: "Järvelin, K., & Kekäläinen, J.",
    venue: "ACM Transactions on Information Systems (TOIS), 20(4)",
    year: 2002,
    themes: ["Evaluation"],
    summary: "Introduces (normalized) discounted cumulative gain, an evaluation measure that rewards placing highly relevant results near the top of a ranked list by applying a positional discount, and normalises against the ideal ordering.",
    relevance: "The source of the NDCG@K metric used here. It is the metric that makes the ranking-quality argument possible — without a position-aware measure, there would be no principled way to show that a model with worse RMSE still produces a better ordered list of restaurants."
  },
  {
    status: "filled",
    title: "Solving Least Squares Problems",
    authors: "Lawson, C. L., & Hanson, R. J.",
    venue: "SIAM Classics in Applied Mathematics (orig. Prentice-Hall, 1974)",
    year: 1995,
    themes: ["Optimization"],
    summary: "The standard reference for constrained least squares, including the active-set algorithm for Non-Negative Least Squares that remains the canonical NNLS solver implemented in scientific computing libraries.",
    relevance: "The mathematical basis for this project's first novel contribution. Learning each user's fusion weights via NNLS guarantees non-negative weights, so no signal can be assigned a negative contribution — which keeps the learned blend interpretable and makes the explainability layer's claims honest."
  },
  {
    status: "filled",
    title: "Explainable Recommendation: A Survey and New Perspectives",
    authors: "Zhang, Y., & Chen, X.",
    venue: "Foundations and Trends in Information Retrieval, 14(1)",
    year: 2020,
    themes: ["Explainability"],
    summary: "Surveys explainable recommendation across model-intrinsic and post-hoc approaches, catalogues explanation styles — user-based, item-based, feature-based and text-based — and argues that explanations improve user trust, satisfaction and persuasiveness independently of accuracy.",
    relevance: "The grounding for this project's second novel contribution. It supplies the categories the explanation templates here fall into — user-based ('similar diners rated it highly') and feature-based ('matches your usual cuisine and price range') — and the argument for why explainability is worth adding even when it does not move an accuracy metric."
  },
];
