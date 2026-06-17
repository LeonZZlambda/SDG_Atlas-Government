# Algorithms Reference

## PageRank
- **Purpose:** Compute node importance in the SDG network based on inbound links.
- **Formula:**
  $$PR_i = \frac{1-d}{N} + d \sum_{j \in \text{In}(i)} \frac{PR_j}{L_j}$$
  where `d` is the damping factor (default 0.85), `N` total nodes, and `L_j` out‑degree of node `j`.
- **Implementation:** Power‑iteration until \|PR⁽ᵗ⁾‑PR⁽ᵗ⁻¹⁾\|₁ < 1e‑6 or max 100 iterations.
- **Complexity:** O(E·I) where `E` edges, `I` iterations.
- **Usage:** Provides centrality weights for impact scoring and as a feature for the Systemic Risk Engine.

## Betweenness Centrality
- **Definition:** Fraction of all‑pairs shortest paths that pass through a node.
- **Algorithm:** Brandes’ algorithm (2001) – single‑source shortest‑paths for each node, accumulating dependencies.
- **Complexity:** O(N·E) for unweighted graphs, O(N·E·logN) for weighted.
- **Interpretation:** High betweenness nodes act as bridges; crucial for cascade risk analysis.

## Analytic Hierarchy Process (AHP)
- **Steps:**
  1. Build pairwise comparison matrices for criteria and alternatives.
  2. Compute eigenvector (or geometric mean) for each matrix → priority weights.
  3. Check consistency ratio (CR < 0.1 recommended).
  4. Aggregate weights to obtain overall ranking.
- **Mathematics:** For matrix `A`, weight vector `w` satisfies `Aw = λ_max w`.
- **Complexity:** O(k³) for `k` criteria/alternatives.
- **Application:** Deriving MCDA weight vectors from expert judgments.

## TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
- **Procedure:**
  1. Normalise decision matrix.
  2. Multiply by criterion weights.
  3. Determine ideal (best) and anti‑ideal (worst) solutions.
  4. Compute Euclidean distance of each alternative to both.
  5. Calculate similarity score: \(C_i = \frac{D_i^-}{D_i^+ + D_i^-}\).
- **Complexity:** O(m·n) for `m` alternatives, `n` criteria.
- **Use‑case:** Ranking SDG portfolio configurations.

## ELECTRE (ELimination Et Choix Traduisant la REalité)
- **Core Concepts:**
  - **Concordance index** `C(a,b)` – weighted sum of criteria where `a` is at least as good as `b`.
  - **Discordance index** `D(a,b)` – measures how much `b` outperforms `a` on any criterion.
- **Outranking:** `a` outranks `b` if `C(a,b) ≥ c*` and `D(a,b) ≤ d*` (thresholds).
- **Algorithm:** Build outranking matrix, derive a partial preorder, then extract a ranking via the distillation procedure.
- **Complexity:** O(m²·n).
- **Role:** Provides a robust alternative to AHP/TOPSIS when criteria are non‑compensatory.

## Risk Propagation Model
- **Goal:** Estimate probability that a failure in one SDG propagates through the network.
- **Mathematical Formulation:**
  $$P_i = 1 - \prod_{j \in \text{Pred}(i)} (1 - w_{ji} \cdot P_j)$$
  where `w_{ji}` is the synergy (or conflict) weight from predecessor `j` to `i` and `P_j` is the failure probability of `j`.
- **Computation:** Topological order traversal (DAG) or iterative fixed‑point for cyclic graphs.
- **Outputs:** Node‑wise systemic risk scores used by the Systemic Risk Engine.

## Core Engines
### Systemic Risk Engine
- Simulates cascades using the Risk Propagation Model.
- Runs Monte Carlo (default 10 000 seeds) to produce a distribution of systemic risk per SDG.
- Generates risk heat‑maps and identifies high‑impact bridges.

### Emergent Behavior Engine
- Agent‑based simulation where each SDG node is an agent with state variables (adoption level, resilience).
- Inter‑agent interactions follow the weighted graph; emergent macro‑patterns (e.g., tipping points) are detected via clustering of time‑series.
- Configurable parameters: number of agents, interaction frequency, stochasticity.

### Tradeoff Analysis Engine
- Constructs a Pareto frontier by varying MCDA weight vectors and budget allocations.
- Calculates conflict‑synergy score: \(T = \sum_{(i,j)} |w_{ij}| \cdot\text{conflict}(i,j)\).
- Provides visualisation (parallel coordinates) and a ranking of trade‑off optimal portfolios.

---
*Prepared by LeonZZlambda – GitHub: LeonZZlambda*
