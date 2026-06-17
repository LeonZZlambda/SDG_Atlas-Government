# Case Study

## Context
- **Stakeholder:** National Ministry of Environment and Sustainable Development.
- **Goal:** Design an integrated SDG portfolio for a five‑year national climate‑resilience program.
- **Constraints:** Fixed budget of $15 M, limited technical staff, mandatory inclusion of at least three climate‑related SDGs.
- **Data Sources:** National SDG indicator database, World Bank project risk catalog, OECD development effectiveness metrics.

## Selected SDGs
| SDG | Target | Rationale |
|-----|--------|-----------|
| 13 – Climate Action | 13.2, 13.3 | Core climate‑resilience objectives. |
| 7 – Affordable and Clean Energy | 7.2, 7.3 | Renewable energy integration. |
| 11 – Sustainable Cities and Communities | 11.2, 11.5 | Urban heat‑island mitigation. |
| 6 – Clean Water and Sanitation | 6.3 | Water security for climate adaptation. |
| 12 – Responsible Consumption | 12.4 | Reduce waste from energy projects.

## Inputs
- **Budget:** $15 M (distributed across initiatives).
- **Timeline:** 5 years.
- **Risk Profile:** Avg. risk probability = 0.18 (derived from World Bank risk assessment).
- **Synergy Coefficients:** Extracted from UN SDSN synergy research (range –0.4 to 0.6).
- **Stakeholder Preferences:** MCDA weight vector (Impact 0.35, Sustainability 0.30, Feasibility 0.25, Alignment 0.10).

## Network Analysis
- Constructed weighted SDG graph using the selected SDGs and synergy coefficients.
- Computed **betweenness centrality** (SDG 13 highest, 0.42) and **PageRank** (SDG 7 top, 0.27).
- Identified **bridge SDGs** where interventions yield network‑wide benefits (SDG 13 & 7).
- Performed **community detection** (Louvain) revealing two clusters: {13,7,11} and {6,12}.

## Scores
| Metric | Value | Interpretation |
|--------|-------|----------------|
| Impact Score (I) | 82.4 | Strong beneficiary efficiency and risk‑adjusted returns. |
| Sustainability Score (S) | 74.1 | High environmental alignment, moderate long‑term viability. |
| Feasibility Score (F) | 68.9 | Acceptable dependency complexity, sufficient team capacity. |
| Overall Score (O) | 77.6 | Balanced portfolio with high systemic impact. |

## Tradeoffs
- **Synergy vs. Risk:** Increasing investment in SDG 13 improves impact but raises exposure to climate‑related risk; Monte Carlo analysis shows a 12 % increase in risk tail probability.
- **Budget Allocation:** Shifting 10 % of funds from SDG 6 to SDG 13 raises overall score to **80.2** but reduces water‑security score by 5 points.
- **Stakeholder Weight Sensitivity:** Varying MCDA weights ±10 % changes top‑ranked portfolio in 18 % of perturbations (ranking robustness index).

## Recommendations
1. **Prioritize SDG 13 interventions** that also boost SDG 7 (e.g., solar‑powered water pumps) to capture synergy benefits.
2. Allocate **$1.5 M** to a pilot clean‑energy micro‑grid in vulnerable urban zones—expected to raise Impact by 4 points with minimal risk increase.
3. Implement **risk mitigation measures** (insurance, phased rollout) for high‑betweenness projects to bound tail risk.
4. Conduct a **follow‑up sensitivity analysis** after the first year to recalibrate synergy coefficients based on observed outcomes.

## Lessons Learned
- **Network‑centric view** uncovered hidden dependencies (e.g., water‑energy nexus) that traditional linear budgeting missed.
- **Monte Carlo stability** checks were crucial; early runs showed unstable rankings until sample size reached 7 000.
- **Stakeholder weight calibration** significantly influences portfolio robustness; iterative stakeholder workshops improved acceptance.
- **Data quality** of synergy coefficients remains a bottleneck; future work should integrate real‑time indicator updates.
