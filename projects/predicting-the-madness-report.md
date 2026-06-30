---
layout: post
title: "Predicting the Madness — Technical Report"
subtitle: "Methods, models, and results behind the NCAA tournament predictor"
thumbnail: /assets/images/march-madness/thumbnail.png
nav_exclude: true
---
**Course:** DTSC 2302 — Project 2  
**Author:** Hampton Abbott  
**Date:** April 2026  
**Repository:** [github.com/HPAuncc/March-Madness-Model](https://github.com/HPAuncc/March-Madness-Model)  
**Companion piece:** [Predicting the Madness case study →](/projects/predicting-the-madness)

---

## 1. Problem Framing & Research Question

**Research question:** Can a machine learning model trained on historical NCAA regular season statistics accurately predict tournament game outcomes — and which features are most predictive of tournament success?

The NCAA Men's Basketball Tournament presents a well-defined binary classification problem: given two teams, predict which one wins. The label is unambiguous (one team wins, one loses), historical data is plentiful (2003–2025), and the domain has a rich set of quantifiable team performance metrics.

The practical motivation: most bracket-picking approaches rely on seeding and intuition. This project tests whether a data-driven, efficiency-based approach can outperform that baseline on held-out tournament data.

---

## 2. Dataset

**Source:** Kaggle — March Machine Learning Mania 2026
**URL:** https://www.kaggle.com/competitions/march-machine-learning-mania-2026

### Key Files Used

| File | Description | Rows |
|------|-------------|------|
| `MRegularSeasonDetailedResults.csv` | Game-level box scores, 2003–2026 | 124,529 |
| `MNCAATourneyDetailedResults.csv` | Tournament game results, 2003–2025 | 1,449 |
| `MNCAATourneySeeds.csv` | Seed assignments per team per season | 2,694 |
| `MTeams.csv` | Team ID to name mapping | 381 |
| `MMasseyOrdinals.csv` | Third-party rankings (KenPom, Sagarin, etc.) | 5,865,001 |

### Dataset Characteristics
- **Seasons covered:** 2003–2025 (training/validation/test), 2026 (live predictions)
- **Tournament games per season:** 63
- **Total matchup rows after symmetric expansion:** 2,898 (each game duplicated with flipped features — see Section 4)
- **Target variable:** Binary (1 = Team A wins, 0 = Team A loses)

---

## 3. Exploratory Data Analysis

EDA was conducted in Section 2 of the notebook to inform feature engineering decisions.

### Key Findings

**Seed win rates:** 1-seeds win ~85% of first-round games. Win rates decline steadily through seed 8, then stabilize — seeds 9–16 all win between 15–35% of their games. This confirmed seed as a meaningful but non-deterministic feature.

**Upset frequency:** The seed matchup heatmap (notebook Section 2) shows that 5 vs. 12 and 6 vs. 11 matchups produce disproportionately frequent upsets relative to seed gap. This is consistent with the well-known "12-over-5" phenomenon in bracket folklore.

**Win margins:** The median win margin is 10 points; mean is 11.7 points. 28.9% of games are decided by 5 or fewer points — confirming significant randomness at the margins that no model should be expected to capture.

**Score correlation:** Winner and loser scores are weakly correlated (high-scoring games tend to have higher loser scores too), suggesting pace of play is a confound that efficiency metrics correct for.

---

## 4. Feature Engineering

All features are derived from **regular season data only** — no tournament game statistics are used to predict tournament outcomes (no data leakage).

### Step 1: Per-Team Season Aggregates

For each `(Season, TeamID)`, the following statistics were computed from `MRegularSeasonDetailedResults.csv`:

| Feature | Formula | Rationale |
|---------|---------|-----------|
| `WinPct` | Wins / Games | Baseline team quality measure |
| `OffEff` | Pts / Possessions × 100 | Points per 100 possessions (offense) |
| `DefEff` | OppPts / Possessions × 100 | Points allowed per 100 possessions (defense) |
| `NetEff` | OffEff − DefEff | Net efficiency margin |
| `eFGPct` | (FGM + 0.5×FGM3) / FGA | Effective field goal %, accounts for 3-pt value |
| `TOVRate` | TO / (FGA + 0.44×FTA + TO) | Turnover rate (Dean Oliver formula) |
| `ORBRate` | OR / (OR + OppDR) | Offensive rebound rate |
| `FTRate` | FTA / FGA | Free throw attempt rate |
| `Def_eFGPct` | OppFGM / OppFGA | Opponent effective FG% (defensive quality) |
| `Def_TOVRate` | OppTO / (OppFGA + OppTO) | Opponent forced turnover rate |

Possessions estimated as: `FGA + 0.44×FTA − OR + TO`

### Step 2: Strength of Schedule

For each team-season, average opponent win percentage was computed across all regular season games. This captures whether a team's record came against strong or weak competition.

### Step 3: KenPom Rankings

From `MMasseyOrdinals.csv`, the most recent KenPom rank (system code `KP`) before day 133 (approximate Selection Sunday) was extracted per team-season. KenPom coverage was 0% prior to the years it appears in the dataset, so missing values were imputed with the training set median (see Section 5).

### Step 4: Matchup Feature Construction

For each tournament game, the feature vector is constructed as the **difference** between Team A's stats and Team B's stats:

```
feature_diff = team_A_stat - team_B_stat
```

This difference-based encoding has two advantages:
1. The model learns relative team strength, not absolute values
2. The same game can be represented from both perspectives (symmetry)

**Symmetric expansion:** Each game is added twice — once with Team A as the winner (label=1) and once from the loser's perspective (all features negated, label=0). This doubles training data and ensures the model sees both winning and losing feature patterns.

**Final feature set (13 features):**
`WinPct_diff`, `OffEff_diff`, `DefEff_diff`, `NetEff_diff`, `eFGPct_diff`, `TOVRate_diff`, `ORBRate_diff`, `FTRate_diff`, `Def_eFGPct_diff`, `Def_TOVRate_diff`, `SOS_diff`, `KenPomRank_diff`, `SeedDiff`

---

## 5. Data Preprocessing & Assumptions

### Missing Value Handling
- `KenPomRank` has 0% coverage in early seasons — the Massey Ordinals dataset does not include KP rankings for all years
- Strategy: impute with **training set median** for all features where median is non-null, then fall back to 0 for columns where the median itself is NaN
- Rationale: median imputation avoids mean distortion from outliers; using only the training set median prevents data leakage into validation/test splits

### Feature Scaling
- `StandardScaler` (zero mean, unit variance) applied to features for **Logistic Regression** and **KNN** only
- Tree-based models (Random Forest, XGBoost) do not require scaling — they are invariant to monotonic feature transformations
- Scaler is fit on training data only and applied to validation/test sets

### Key Assumptions
1. **Regular season stats are predictive of tournament performance** — this is the core modeling assumption. It holds reasonably well but ignores in-season injuries, momentum, and bracket position
2. **Stationarity** — the relationship between team stats and tournament outcomes is assumed stable across 2003–2025. Rule changes (e.g., shot clock modifications) could introduce drift
3. **Symmetric matchups** — both teams in a matchup are treated as interchangeable; home court advantage is irrelevant in tournament play (all neutral sites)

---

## 6. Train / Validation / Test Split

A strict **temporal split** was used to prevent any future data from influencing training:

| Split | Seasons | Games (rows after expansion) | Purpose |
|-------|---------|------|---------|
| Train | 2003–2023 | 2,630 | Model fitting |
| Validation | 2024 | 134 | Hyperparameter selection, model comparison |
| Test | 2025 | 134 | Final held-out evaluation |
| Predict | 2026 | — | Live bracket predictions |

**Rationale for temporal split over random split:** Random splitting would allow the model to train on 2025 data and validate on 2010 data, which would overstate generalization performance. Tournament prediction is inherently a forward-looking task — we always train on the past and predict the future.

---

## 7. Model Experiments

Four models were selected to represent a range of complexity and interpretability:

| Model | Why Selected |
|-------|-------------|
| **Logistic Regression** | Linear baseline; highly interpretable via coefficients; fast to train |
| **K-Nearest Neighbors** | Non-parametric; tests whether similar teams (in feature space) have similar outcomes |
| **Random Forest** | Ensemble method; handles non-linearity and feature interactions; provides feature importances |
| **XGBoost** | Gradient-boosted trees; typically strong performer on tabular data; provides feature importances |

### Hyperparameters

```python
LogisticRegression(C=1.0, max_iter=1000, random_state=42)
KNeighborsClassifier(n_neighbors=11)
RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42)
XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=4,
              subsample=0.8, eval_metric='logloss', random_state=42)
```

KNN with `n_neighbors=11` was chosen to avoid ties (odd number) while smoothing over local noise. Random Forest `max_depth=6` prevents overfitting on a small dataset. XGBoost `learning_rate=0.05` with 300 estimators follows standard practice for small tabular datasets.

---

## 8. Model Evaluation & Interpretation

### Validation Set Results (2024 Tournament)

| Model | Accuracy | Log Loss | ROC-AUC |
|-------|----------|----------|---------|
| Logistic Regression | 0.672 | 0.569 | 0.764 |
| K-Nearest Neighbors | 0.567 | 0.631 | 0.655 |
| **Random Forest** | **0.694** | **0.565** | **0.769** |
| XGBoost | 0.642 | 0.631 | 0.720 |

**Best model selected:** Random Forest (lowest log loss on validation set)

**Why log loss over accuracy:** Log loss penalizes confident wrong predictions — a model that says "70% chance Team A wins" and Team A loses is penalized more than one that says "52%." For bracket prediction, calibrated probabilities matter, not just binary picks.

### Test Set Results (2025 Tournament — Held Out)

| Model | Accuracy | Log Loss | ROC-AUC |
|-------|----------|----------|---------|
| Logistic Regression | 0.761 | 0.470 | 0.869 |
| K-Nearest Neighbors | 0.851 | 0.441 | 0.881 |
| Random Forest | 0.739 | 0.468 | 0.883 |
| XGBoost | 0.754 | 0.477 | 0.848 |

All models significantly outperform the 50% random baseline on the 2025 tournament. The improvement from validation to test accuracy is notable — 2025 may have been a year with fewer major upsets than 2024.

### Interpretation

The Random Forest was best on validation log loss but KNN outperformed it on the test set. This suggests the optimal model may vary year-to-year — an ensemble or stacking approach could provide more stable performance across seasons.

All models share the characteristic of predicting expected winners well but struggling with upsets. This is expected: upsets are, by definition, low-probability events that the model correctly assigns low probability to — but they happen anyway.

---

## 9. Feature Importance

Feature importance was extracted from Random Forest (`feature_importances_`), XGBoost (gain-based), and Logistic Regression (coefficient magnitudes). See Section 6 of the notebook for full charts.

**Consistent top features across models:**
1. `SeedDiff` — seed gap between teams; strongest individual predictor by a wide margin
2. `SOS_diff` — strength of schedule difference; second most important feature
3. `NetEff_diff` — net efficiency difference; strongest efficiency-based predictor
4. `OffEff_diff` — offensive efficiency gap
5. `WinPct_diff` — win percentage gap

**Notable finding:** `TOVRate_diff` and `FTRate_diff` ranked consistently low across all models, suggesting that turnovers and free throw attempts are less predictive of tournament outcomes than efficiency and overall record. This aligns with basketball analytics literature suggesting that efficiency (not volume) is the key discriminator.

**Logistic Regression coefficients:** Positive coefficients (features that increase win probability when Team A is better) were highest for `NetEff_diff` and `SeedDiff`. Negative coefficients appeared for `DefEff_diff` — a higher defensive efficiency number is worse (more points allowed per possession).

---

## 10. 2026 Predictions & Results

2026 regular season stats were computed using the same `build_team_stats()` pipeline applied to 2003–2025 data. The 2026 KenPom rankings and strength of schedule were computed from 2026 regular season games only.

The 2026 seeds are available in the Kaggle dataset (68 teams). Win probabilities for each matchup are generated by `predict_game()`, which constructs the difference feature vector and passes it through the trained Random Forest model.

### Final Results (Complete 2026 Tournament)

All game outcomes were manually sourced from NCAA.com and entered in Section 8 of the notebook, as the Kaggle dataset had not published 2026 tournament results by the project deadline.

| Round | Correct | Total | Accuracy |
|-------|---------|-------|----------|
| Round of 64 | 23 | 28 | 82.1% |
| Round of 32 | 12 | 16 | 75.0% |
| Sweet 16 | 5 | 8 | 62.5% |
| Elite Eight | 3 | 4 | 75.0% |
| Final Four | 2 | 2 | 100.0% |
| Championship | 1 | 1 | 100.0% |
| **Main Bracket Total** | **46** | **59** | **78.0%** |

*Note: The First Four (play-in games) are excluded from main bracket accuracy — those games match teams of identical seed, so the model has no meaningful differential signal and coin-flip accuracy is expected.*

### Interpretation

The model performed strongest in the Round of 64, where seed gaps and efficiency differentials are typically largest. Performance declined in the Sweet 16, where remaining teams are closely matched and genuine randomness dominates. The model recovered strongly in the Final Four and Championship, correctly predicting all three games including the national champion.

**2026 Champion: Michigan Wolverines** — defeated UConn 69–63 on April 6. The model correctly identified Michigan as the winner of both the Final Four and the Championship game.

---

## 11. Limitations, Ethics & Reflection

### Limitations

1. **Small sample size:** 63 tournament games per year × 22 years = ~1,400 total games. This is a small dataset for machine learning — the model cannot learn rare upset patterns reliably.

2. **No in-season dynamics:** Features are season-level averages. A team that peaked in February and declined in March looks the same as one that's on a hot streak. Recency-weighted features could improve this.

3. **Missing KenPom coverage:** KenPom rankings are absent for early seasons in the Massey Ordinals file, requiring imputation. This weakens the model for those years.

4. **Bracket path independence:** The model predicts individual matchups independently. It does not account for fatigue, injury, or the fact that a team's opponent in round 3 depends on who won rounds 1 and 2.

5. **Outcome variance:** March Madness has genuine randomness. Games decided by 1–3 possessions are not reliably predictable from season-level statistics. A model that achieves 75–85% accuracy is likely near the ceiling for this approach.

### Ethical Considerations

- The model uses publicly available game data with no personally identifiable information
- Tournament predictions could theoretically inform gambling decisions — this project is purely academic and not intended for that purpose
- Seeds and rankings reflect human committee decisions that may embed biases (e.g., conference prestige, geography). These are used as features here without attempting to correct for them

### Reflection

The most surprising finding was that KNN — the simplest non-parametric model — outperformed XGBoost on the 2025 test set. This suggests the feature space may have a relatively smooth structure where "similar teams" (in terms of stats) genuinely have similar outcomes. It also highlights that more complex models don't always win on small datasets.

The project confirms that data-driven efficiency metrics are genuinely predictive of tournament success, but the gap between good predictions and perfect predictions is largely explained by the inherent randomness of close games — not model inadequacy.

---

## 12. Code Quality & Reproducibility

The full analysis is contained in a single Jupyter notebook (`notebooks/march_madness.ipynb`) with the following structure:

1. Setup & Data Loading
2. Exploratory Data Analysis
3. Feature Engineering
4. Train / Validation / Test Split
5. Model Training & Comparison
6. Feature Importance
7. 2026 Tournament Predictions
8. Results vs. Actuals

To reproduce:
```bash
# 1. Clone the repo
git clone https://github.com/HPAuncc/March-Madness-Model.git

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download data (requires Kaggle API token)
kaggle competitions download -c march-machine-learning-mania-2026 -p data/raw
unzip data/raw/march-machine-learning-mania-2026.zip -d data/raw

# 4. Run notebook
jupyter notebook notebooks/march_madness.ipynb
```

---

## References & AI Transparency

**Dataset:** Kaggle — March Machine Learning Mania 2026. https://www.kaggle.com/competitions/march-machine-learning-mania-2026

**Libraries:**
- pandas, numpy — data manipulation
- scikit-learn — Logistic Regression, KNN, Random Forest, StandardScaler, metrics
- xgboost — XGBoost classifier
- matplotlib, seaborn — visualizations

**Basketball analytics reference:** Oliver, D. (2004). *Basketball on Paper*. Brassey's Inc. — source for the Four Factors framework (eFG%, TOV rate, ORB rate, FT rate) and possession estimation formula.

**AI tools used:** Claude (Anthropic) was used to help structure and debug the notebook and assist with feature engineering. All modeling decisions, interpretations, and written analysis reflect my own understanding and judgment.
