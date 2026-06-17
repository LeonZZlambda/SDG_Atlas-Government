# Validation

## Sensitivity Analysis

- **Objective:** Quantify how variations in input parameters (budget, timeline, risk probability, synergy coefficients) influence each scoring component (Impact, Sustainability, Feasibility, Overall).
- **Method:** Perform one‑factor‑at‑a‑time (OFAT) sweeps across a plausible range (±20 %). Record resulting score deltas and compute partial rank correlation coefficients (PRCC).
- **Reporting:** Include tornado plots per score, a sensitivity matrix table, and a narrative interpreting the most influential parameters.

## Monte Carlo Stability

- **Setup:** 5 000–10 000 simulation runs sampling all stochastic inputs (risk probability, synergy coefficients, budget uncertainty) from calibrated probability distributions (Beta for probabilities, Normal for coefficients).
- **Convergence Check:** Track the Gelman‑Rubin statistic and the width of 95 % confidence intervals for each score as runs increase. Stop when the interval width falls below 1 % of the mean.
- **Stability Metrics:** Coefficient of variation (CV) for each score, and the proportion of runs where the ranking order is unchanged.

## Ranking Robustness

- **Perturbation Tests:** Randomly perturb weight vectors in the MCDA aggregation (±10 % Dirichlet noise) and recompute rankings.
- **Robustness Index:** Fraction of perturbations that preserve the top‑3 portfolio recommendations.
- **Visualization:** Heat‑map of pairwise ranking agreement (Kendall‑tau) across perturbations.

## Edge Cases

- **Zero‑Budget Projects:** Verify that the impact formula gracefully returns a baseline score and flags infeasibility.
- **Extreme Risk (probability = 1):** Confirm risk‑adjusted return collapses to 0 and that downstream scores reflect this.
- **Sparse SDG Selection (single SDG):** Test that network‑based metrics (centrality, synergy) default to neutral values.

## Known Failure Modes

| Failure Mode | Symptoms | Mitigation |
|---|---|---|
| Divergent Monte Carlo runs | Confidence intervals never shrink | Increase sample size, tighten input distributions |
| Rank instability | Top‑rank swaps > 30 % of perturbations | Re‑calibrate MCDA weights, add regularization |
| Missing synergy data | NaN in network metrics | Provide fallback default weight (0) and log warning |

## Future Validation Work

- **Empirical Validation:** Apply the framework to at least three real‑world SDG portfolio case studies and compare predicted outcomes with observed impacts.
- **User Study:** Collect qualitative feedback from domain experts on interpretability of sensitivity reports.
- **Benchmarking:** Compare Monte Carlo stability and ranking robustness against alternative decision‑support tools (e.g., Analytica, @RISK).
- **Automation:** Develop CI pipelines that run a full validation suite on every code change.
