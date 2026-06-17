# Graph Model for SDG Network Analysis

This document provides a comprehensive technical overview of the graph-theoretic foundations of the SDG Decision Intelligence Framework, including graph construction, centrality measures, community detection, and influence propagation.

---

## Table of Contents

1. [Graph Construction](#graph-construction)
2. [Graph Properties](#graph-properties)
3. [Centrality Measures](#centrality-measures)
4. [Community Detection](#community-detection)
5. [Path Analysis](#path-analysis)
6. [Influence Propagation](#influence-propagation)
7. [Algorithmic Complexity](#algorithmic-complexity)
8. [Visualization](#visualization)

---

## Graph Construction

### SDG Network Definition

The Sustainable Development Goals are modeled as a weighted undirected graph G = (V, E, W) where:

- **V** (Vertices): Set of 17 SDGs, labeled 1-17
- **E** (Edges): Set of 136 pairwise relationships between SDGs
- **W** (Weights): Edge weights in range [-1, +1] representing interaction strength

### Graph Representation

```typescript
interface GraphNode {
  id: number;        // SDG ID (1-17)
  label: string;     // SDG name
  weight?: number;   // Optional node weight
}

interface GraphEdge {
  from: number;      // Source SDG ID
  to: number;        // Target SDG ID
  weight: number;    // Synergy coefficient [-1, +1]
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

### Edge Weight Semantics

Edge weights represent the nature and strength of SDG interactions:

| Weight Range | Interpretation | Example |
|--------------|----------------|---------|
| [+0.7, +1.0] | Strong Synergy | SDG 4 (Education) ↔ SDG 8 (Decent Work) |
| [+0.4, +0.7) | Moderate Synergy | SDG 3 (Health) ↔ SDG 4 (Education) |
| [+0.1, +0.4) | Weak Synergy | SDG 1 (Poverty) ↔ SDG 2 (Hunger) |
| [-0.1, +0.1) | Neutral | SDG 9 (Industry) ↔ SDG 16 (Peace) |
| [-0.4, -0.1) | Weak Conflict | SDG 8 (Growth) ↔ SDG 12 (Consumption) |
| [-0.7, -0.4) | Moderate Conflict | SDG 8 (Growth) ↔ SDG 13 (Climate) |
| [-1.0, -0.7) | Strong Conflict | SDG 2 (Hunger) ↔ SDG 15 (Life on Land) |

### Synergy Coefficient Source

Synergy coefficients are derived from:

1. **UN SDSN Research (2019)**: "Mapping the SDG Interconnection Network"
2. **Nature Sustainability (2020)**: "Synergies and Trade-offs Among SDGs"
3. **Expert Elicitation**: Domain expert assessments for missing pairs

### Graph Construction Algorithm

```typescript
function buildSDGGraph(sdgIds: number[]): Graph {
  const nodes = sdgIds.map(id => ({
    id,
    label: `SDG ${id}`,
  }));
  
  const edges: GraphEdge[] = [];
  
  // Generate all pairwise edges
  for (let i = 0; i < sdgIds.length; i++) {
    for (let j = i + 1; j < sdgIds.length; j++) {
      const coefficient = getCoefficient(sdgIds[i], sdgIds[j]);
      edges.push({
        from: sdgIds[i],
        to: sdgIds[j],
        weight: coefficient,
      });
    }
  }
  
  return { nodes, edges };
}
```

---

## Graph Properties

### Basic Properties

For the complete SDG network (17 nodes, 136 edges):

| Property | Value | Interpretation |
|----------|-------|----------------|
| Order (|V|) | 17 | Number of SDGs |
| Size (|E|) | 136 | Number of pairwise relationships |
| Density | 2|E| / (|V|(|V|-1)) = 1.0 | Complete graph (all pairs connected) |
| Average Degree | 2|E| / |V| = 16 | Each SDG connected to all others |
| Diameter | 2 | Maximum shortest path length |
| Average Path Length | 1.0 | Average distance between nodes |

### Weighted Properties

| Property | Calculation | Interpretation |
|----------|-------------|----------------|
| Average Weight | Σw / |E| | Mean synergy/conflict strength |
| Weight Variance | Σ(w - μ)² / |E| | Dispersion of interaction strengths |
| Positive Edge Ratio | |E⁺| / |E| | Proportion of synergistic relationships |
| Negative Edge Ratio | |E⁻| / |E| | Proportion of conflicting relationships |
| Net Synergy | Σw / |E| | Overall network balance |

### Subgraph Properties

For a selected subset of SDGs (k nodes):

| Property | Formula | Range |
|----------|---------|-------|
| Internal Density | 2|E_int| / (k(k-1)) | [0, 1] |
| External Connectivity | |E_ext| / (k(17-k)) | [0, 1] |
| Cohesion | Internal Density - External Connectivity | [-1, 1] |

---

## Centrality Measures

Centrality measures identify the most important or influential nodes in the SDG network. Different centrality metrics capture different notions of importance.

### Degree Centrality

**Definition**: Number of direct connections a node has, normalized by the maximum possible connections.

**Formula**:
```
C_D(v) = deg(v) / (n - 1)
```

Where:
- `deg(v)` = number of edges incident to node v
- `n` = total number of nodes

**Interpretation**:
- High degree: SDG is highly connected, interacts with many other goals
- Low degree: SDG has fewer direct interactions

**Algorithm**:
```typescript
function calculateDegreeCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  const n = graph.nodes.length;
  
  // Initialize all nodes with 0
  graph.nodes.forEach(node => centrality.set(node.id, 0));
  
  // Count connections (undirected graph)
  graph.edges.forEach(edge => {
    const fromCount = centrality.get(edge.from) || 0;
    const toCount = centrality.get(edge.to) || 0;
    centrality.set(edge.from, fromCount + 1);
    centrality.set(edge.to, toCount + 1);
  });
  
  // Normalize by (n-1)
  centrality.forEach((value, key) => {
    centrality.set(key, n > 1 ? value / (n - 1) : 0);
  });
  
  return centrality;
}
```

**Complexity**: O(|V| + |E|)

**SDG Rankings (Typical)**:
1. SDG 17 (Partnerships) - Connects all goals through implementation
2. SDG 10 (Reduced Inequalities) - Cross-cutting theme
3. SDG 16 (Peace & Justice) - Foundation for all goals

---

### Betweenness Centrality

**Definition**: Frequency with which a node appears on shortest paths between other nodes. Measures bridge importance.

**Formula**:
```
C_B(v) = Σ_{s≠v≠t} σ_st(v) / σ_st
```

Where:
- `σ_st` = number of shortest paths from s to t
- `σ_st(v)` = number of shortest paths from s to t passing through v

**Algorithm**: Brandes' Algorithm (2001)

```typescript
function calculateBetweennessCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  const n = graph.nodes.length;
  
  // Initialize all nodes with 0
  graph.nodes.forEach(node => centrality.set(node.id, 0));
  
  // Build adjacency list
  const adj = buildAdjacencyList(graph);
  
  // For each node as source
  for (const source of graph.nodes) {
    const S: number[] = [];
    const P = new Map<number, number[]>();
    const sigma = new Map<number, number>();
    const d = new Map<number, number>();
    
    // Initialize
    graph.nodes.forEach(node => {
      P.set(node.id, []);
      sigma.set(node.id, 0);
      d.set(node.id, -1);
    });
    
    sigma.set(source.id, 1);
    d.set(source.id, 0);
    
    const queue: number[] = [source.id];
    
    // BFS to find shortest paths
    while (queue.length > 0) {
      const v = queue.shift()!;
      S.push(v);
      
      const neighbors = adj.get(v) || [];
      for (const { node: w } of neighbors) {
        if (d.get(w)! === -1) {
          d.set(w, d.get(v)! + 1);
          queue.push(w);
        }
        
        if (d.get(w)! === d.get(v)! + 1) {
          sigma.set(w, (sigma.get(w) || 0) + (sigma.get(v) || 0));
          P.get(w)?.push(v);
        }
      }
    }
    
    // Accumulate betweenness
    const delta = new Map<number, number>();
    graph.nodes.forEach(node => delta.set(node.id, 0));
    
    while (S.length > 0) {
      const w = S.pop()!;
      const predecessors = P.get(w) || [];
      
      for (const v of predecessors) {
        const c = ((sigma.get(v) || 0) / (sigma.get(w) || 1)) * (1 + (delta.get(w) || 0));
        delta.set(v, (delta.get(v) || 0) + c);
      }
      
      if (w !== source.id) {
        centrality.set(w, (centrality.get(w) || 0) + delta.get(w)!);
      }
    }
  }
  
  // Normalize by (n-1)(n-2)/2 for undirected graphs
  const normalization = n > 2 ? ((n - 1) * (n - 2)) / 2 : 1;
  centrality.forEach((value, key) => {
    centrality.set(key, value / normalization);
  });
  
  return centrality;
}
```

**Complexity**: O(|V||E|) for unweighted graphs

**Interpretation**:
- High betweenness: SDG acts as a bridge between network segments
- Low betweenness: SDG is peripheral to network flow

**SDG Rankings (Typical)**:
1. SDG 9 (Industry, Innovation) - Bridges economic and environmental goals
2. SDG 8 (Decent Work) - Connects economic and social goals
3. SDG 7 (Clean Energy) - Links energy access with climate action

**Reference**: Brandes, U. (2001). "A Faster Algorithm for Betweenness Centrality". Journal of Mathematical Sociology.

---

### Closeness Centrality

**Definition**: Inverse of the average shortest path distance to all other nodes. Measures how quickly a node can reach all others.

**Formula**:
```
C_C(v) = (n - 1) / Σ_{u≠v} d(v, u)
```

Where:
- `d(v, u)` = shortest path distance from v to u
- `n` = total number of nodes

**Algorithm**: Dijkstra's algorithm for each node

```typescript
function calculateClosenessCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  const adj = buildAdjacencyList(graph);
  
  // For each node
  for (const source of graph.nodes) {
    const distances = dijkstra(graph, source.id, adj);
    let totalDistance = 0;
    let reachableNodes = 0;
    
    distances.forEach((dist, nodeId) => {
      if (nodeId !== source.id && dist < Infinity) {
        totalDistance += dist;
        reachableNodes++;
      }
    });
    
    if (reachableNodes > 0) {
      const closeness = (reachableNodes - 1) / totalDistance;
      centrality.set(source.id, closeness);
    } else {
      centrality.set(source.id, 0);
    }
  }
  
  return centrality;
}
```

**Complexity**: O(|V|(|V|log|V| + |E|)) using Dijkstra with priority queue

**Interpretation**:
- High closeness: SDG can influence all others quickly
- Low closeness: SDG is distant from some goals

**SDG Rankings (Typical)**:
1. SDG 17 (Partnerships) - Can reach all goals through collaboration
2. SDG 10 (Reduced Inequalities) - Central to cross-cutting issues
3. SDG 1 (No Poverty) - Foundational goal affecting all others

---

### PageRank Centrality

**Definition**: Measure of node importance based on the structure of incoming links. Uses iterative random walk model.

**Formula**:
```
PR(v) = (1 - d) / n + d × Σ_{u∈M(v)} PR(u) / L(u)
```

Where:
- `d` = damping factor (typically 0.85)
- `n` = total number of nodes
- `M(v)` = set of nodes linking to v
- `L(u)` = number of outbound links from u

**Algorithm**: Power iteration method

```typescript
function calculatePageRank(
  graph: Graph, 
  dampingFactor: number = 0.85, 
  iterations: number = 100
): Map<number, number> {
  const rank = new Map<number, number>();
  
  // Initialize all nodes with 1/n
  const initialRank = 1 / graph.nodes.length;
  graph.nodes.forEach(node => rank.set(node.id, initialRank));
  
  // Build adjacency list (outgoing edges)
  const adj = buildAdjacencyList(graph);
  
  // Calculate out-degree for each node
  const outDegree = new Map<number, number>();
  graph.nodes.forEach(node => outDegree.set(node.id, 0));
  graph.edges.forEach(edge => {
    outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
  });
  
  // Iterative algorithm
  for (let i = 0; i < iterations; i++) {
    const newRank = new Map<number, number>();
    
    graph.nodes.forEach(node => {
      let sum = 0;
      
      // Sum PageRank of incoming neighbors
      graph.edges.forEach(edge => {
        if (edge.to === node.id) {
          const neighborRank = rank.get(edge.from) || initialRank;
          const neighborOutDegree = outDegree.get(edge.from) || 1;
          sum += neighborRank / neighborOutDegree;
        }
      });
      
      const pageRank = (1 - dampingFactor) / graph.nodes.length + dampingFactor * sum;
      newRank.set(node.id, pageRank);
    });
    
    // Update ranks
    newRank.forEach((value, key) => rank.set(key, value));
  }
  
  return rank;
}
```

**Complexity**: O(k|E|) where k is number of iterations

**Interpretation**:
- High PageRank: SDG receives influence from many important SDGs
- Low PageRank: SDG has limited incoming influence

**SDG Rankings (Typical)**:
1. SDG 17 (Partnerships) - Receives influence from all implementation goals
2. SDG 9 (Industry) - Central to economic and environmental linkages
3. SDG 8 (Decent Work) - Key connector in economic-social network

**Reference**: Page, L., et al. (1999). "The PageRank Citation Ranking: Bringing Order to the Web". Stanford University.

---

### Weighted Degree Centrality

**Definition**: Sum of edge weights for each node, capturing interaction strength rather than just count.

**Formula**:
```
C_WD(v) = Σ_{u∈N(v)} w(v, u)
```

Where:
- `N(v)` = set of neighbors of v
- `w(v, u)` = weight of edge between v and u

**Algorithm**:
```typescript
function calculateWeightedDegreeCentrality(graph: Graph): Map<number, number> {
  const centrality = new Map<number, number>();
  
  // Initialize all nodes with 0
  graph.nodes.forEach(node => centrality.set(node.id, 0));
  
  // Sum edge weights
  graph.edges.forEach(edge => {
    const fromWeight = centrality.get(edge.from) || 0;
    const toWeight = centrality.get(edge.to) || 0;
    centrality.set(edge.from, fromWeight + edge.weight);
    centrality.set(edge.to, toWeight + edge.weight);
  });
  
  return centrality;
}
```

**Complexity**: O(|E|)

**Interpretation**:
- High weighted degree: SDG has strong synergistic relationships
- Low weighted degree: SDG has weak or conflicting relationships

---

## Community Detection

Community detection identifies groups of SDGs that are more densely connected internally than with the rest of the network.

### Label Propagation Algorithm

**Definition**: Iterative algorithm where nodes adopt the label most frequent among their neighbors.

**Algorithm**:
```typescript
function detectCommunities(graph: Graph): Map<number, number> {
  const labels = new Map<number, number>();
  
  // Initialize each node with its own label
  graph.nodes.forEach(node => labels.set(node.id, node.id));
  
  // Build adjacency list
  const adj = buildAdjacencyList(graph);
  
  let changed = true;
  let iterations = 0;
  const maxIterations = 100;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Shuffle nodes for random order
    const shuffledNodes = [...graph.nodes].sort(() => Math.random() - 0.5);
    
    for (const node of shuffledNodes) {
      const neighbors = adj.get(node.id) || [];
      if (neighbors.length === 0) continue;
      
      // Count label frequencies among neighbors
      const labelCounts = new Map<number, number>();
      for (const neighbor of neighbors) {
        const label = labels.get(neighbor) || neighbor;
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      }
      
      // Find most frequent label
      let maxCount = 0;
      let newLabel = labels.get(node.id) || node.id;
      
      labelCounts.forEach((count, label) => {
        if (count > maxCount || (count === maxCount && label < newLabel)) {
          maxCount = count;
          newLabel = label;
        }
      });
      
      if (newLabel !== labels.get(node.id)) {
        labels.set(node.id, newLabel);
        changed = true;
      }
    }
  }
  
  return labels;
}
```

**Complexity**: O(k|E|) where k is iterations (typically converges in < 50)

**SDG Communities (Typical)**:

**Community 1: Social Foundation**
- SDG 1 (No Poverty)
- SDG 2 (Zero Hunger)
- SDG 3 (Good Health)
- SDG 4 (Quality Education)
- SDG 5 (Gender Equality)

**Community 2: Economic Growth**
- SDG 8 (Decent Work)
- SDG 9 (Industry)
- SDG 10 (Reduced Inequalities)

**Community 3: Environmental Sustainability**
- SDG 6 (Clean Water)
- SDG 7 (Clean Energy)
- SDG 11 (Sustainable Cities)
- SDG 12 (Responsible Consumption)
- SDG 13 (Climate Action)
- SDG 14 (Life Below Water)
- SDG 15 (Life on Land)

**Community 4: Governance & Peace**
- SDG 16 (Peace & Justice)
- SDG 17 (Partnerships)

**Reference**: Raghavan, U.N., et al. (2007). "Near linear time algorithm to detect community structures in large-scale networks". Physical Review E.

---

### Clustering Coefficient

**Definition**: Measures how connected a node's neighbors are to each other. Indicates local transitivity.

**Formula**:
```
C(v) = 2T(v) / (deg(v)(deg(v) - 1))
```

Where:
- `T(v)` = number of triangles involving v
- `deg(v)` = degree of v

**Algorithm**:
```typescript
function calculateClusteringCoefficient(graph: Graph): Map<number, number> {
  const coefficients = new Map<number, number>();
  const adj = buildAdjacencySet(graph);
  
  for (const node of graph.nodes) {
    const neighbors = adj.get(node.id) || new Set();
    const k = neighbors.size;
    
    if (k < 2) {
      coefficients.set(node.id, 0);
      continue;
    }
    
    let connectedNeighbors = 0;
    const neighborArray = Array.from(neighbors);
    
    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        const neighbor1 = neighborArray[i];
        const neighbor2 = neighborArray[j];
        
        if (adj.get(neighbor1)?.has(neighbor2)) {
          connectedNeighbors++;
        }
      }
    }
    
    const possibleConnections = (k * (k - 1)) / 2;
    const coefficient = possibleConnections > 0 ? connectedNeighbors / possibleConnections : 0;
    coefficients.set(node.id, coefficient);
  }
  
  return coefficients;
}
```

**Complexity**: O(|V|⟨k⟩²) where ⟨k⟩ is average degree

**Interpretation**:
- High clustering: SDG's neighbors are well-connected (tight community)
- Low clustering: SDG's neighbors are sparsely connected (bridge position)

---

## Path Analysis

### Shortest Path (Dijkstra's Algorithm)

**Definition**: Finds the shortest path between two nodes based on edge weights.

**Algorithm**:
```typescript
function findShortestPath(graph: Graph, from: number, to: number): number[] {
  const adj = buildAdjacencyList(graph);
  const distances = new Map<number, number>();
  const previous = new Map<number, number | null>();
  const visited = new Set<number>();
  
  // Initialize
  graph.nodes.forEach(node => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  });
  distances.set(from, 0);
  
  while (visited.size < graph.nodes.length) {
    // Find unvisited node with minimum distance
    let minDist = Infinity;
    let minNode = -1;
    
    graph.nodes.forEach(node => {
      if (!visited.has(node.id) && distances.get(node.id)! < minDist) {
        minDist = distances.get(node.id)!;
        minNode = node.id;
      }
    });
    
    if (minNode === -1 || minDist === Infinity) break;
    if (minNode === to) break;
    
    visited.add(minNode);
    
    // Update distances to neighbors
    const neighbors = adj.get(minNode) || [];
    for (const { node: neighbor, weight } of neighbors) {
      if (!visited.has(neighbor)) {
        const newDist = minDist + weight;
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, minNode);
        }
      }
    }
  }
  
  // Reconstruct path
  const path: number[] = [];
  let currentNode = to;
  while (true) {
    path.unshift(currentNode);
    const prev = previous.get(currentNode);
    if (prev === undefined || prev === null) break;
    currentNode = prev;
  }
  
  return path[0] === from ? path : [];
}
```

**Complexity**: O(|V|²) with simple implementation, O(|V|log|V| + |E|) with priority queue

**Applications**:
- Identify critical paths for SDG implementation
- Find bridge SDGs that connect network segments
- Calculate influence propagation routes

---

### All-Pairs Shortest Paths

**Definition**: Computes shortest paths between all pairs of nodes.

**Applications**:
- Closeness centrality calculation
- Network diameter determination
- Average path length calculation

**Complexity**: O(|V|³) with Floyd-Warshall, O(|V|(|V|log|V| + |E|)) with repeated Dijkstra

---

## Influence Propagation

### Linear Threshold Model

**Definition**: Nodes activate when the weighted sum of active neighbors exceeds a threshold.

**Formula**:
```
Activate(v) if Σ_{u∈N(v)∩A} w(u, v) ≥ θ_v
```

Where:
- `A` = set of active nodes
- `θ_v` = threshold for node v (typically 0.5)
- `w(u, v)` = edge weight from u to v

**Application**: Model how progress in one SDG spreads to others through synergies.

---

### Independent Cascade Model

**Definition**: Active nodes have one chance to activate each neighbor with probability proportional to edge weight.

**Algorithm**:
```typescript
function simulateCascade(
  graph: Graph, 
  initialActive: Set<number>, 
  propagationProbability: number = 0.5
): Set<number> {
  const active = new Set(initialActive);
  const newlyActive = new Set(initialActive);
  
  while (newlyActive.size > 0) {
    const nextActive = new Set<number>();
    
    for (const node of newlyActive) {
      const neighbors = getNeighbors(graph, node);
      
      for (const neighbor of neighbors) {
        if (!active.has(neighbor)) {
          const edgeWeight = getEdgeWeight(graph, node, neighbor);
          const probability = Math.abs(edgeWeight) * propagationProbability;
          
          if (Math.random() < probability) {
            nextActive.add(neighbor);
          }
        }
      }
    }
    
    nextActive.forEach(n => active.add(n));
    newlyActive.clear();
    nextActive.forEach(n => newlyActive.add(n));
  }
  
  return active;
}
```

**Application**: Simulate how SDG progress cascades through the network.

---

### Systemic Influence Score

**Definition**: Combines centrality measures to estimate overall systemic influence.

**Formula**:
```
SI(v) = α·C_D(v) + β·C_B(v) + γ·C_C(v) + δ·PR(v)
```

Where:
- `α, β, γ, δ` = weighting parameters (default: 0.25 each)
- `C_D(v)` = degree centrality
- `C_B(v)` = betweenness centrality
- `C_C(v)` = closeness centrality
- `PR(v)` = PageRank

**Application**: Identify SDGs with maximum systemic influence for strategic targeting.

---

## Algorithmic Complexity Summary

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| Degree Centrality | O(V + E) | O(V) | Quick importance assessment |
| Betweenness Centrality | O(VE) | O(V²) | Bridge identification |
| Closeness Centrality | O(V(VlogV + E)) | O(V + E) | Reachability analysis |
| PageRank | O(kE) | O(V + E) | Influence propagation |
| Community Detection | O(kE) | O(V + E) | Cluster identification |
| Clustering Coefficient | O(V⟨k⟩²) | O(V + E) | Local connectivity |
| Shortest Path | O(V²) or O(VlogV + E) | O(V + E) | Path analysis |
| Cascade Simulation | O(kE) | O(V + E) | Influence propagation |

Where:
- V = number of vertices (17 for full SDG network)
- E = number of edges (136 for full SDG network)
- k = number of iterations
- ⟨k⟩ = average degree

---

## Visualization

### Network Visualization

The framework provides interactive visualization of the SDG network:

**Visual Encoding**:
- **Nodes**: SDGs, sized by degree centrality
- **Edges**: Pairwise relationships, colored by weight (green = synergy, red = conflict)
- **Communities**: Node colors indicate community membership
- **Labels**: SDG numbers and names

**Interactions**:
- **Hover**: Show SDG details and centrality scores
- **Click**: Select/deselect SDG for analysis
- **Zoom**: Navigate large networks
- **Filter**: Show/hide edges by weight threshold

### Centrality Visualization

**Radar Charts**: Compare centrality measures across SDGs
- Each axis represents a centrality metric
- SDGs plotted as polygons
- Area indicates overall centrality

**Bar Charts**: Rank SDGs by specific centrality measure
- X-axis: SDGs
- Y-axis: Centrality score
- Color-coded by community

### Community Visualization

**Force-Directed Layout**: Communities naturally cluster
- Nodes in same community attracted to each other
- Inter-community edges shown as bridges
- Community boundaries visible

**Chord Diagram**: Show inter-community connections
- Arcs represent communities
- Ribbons show connection strength
- Thickness indicates edge weight

---

## Limitations and Assumptions

### Limitations

1. **Static Network**: Assumes SDG relationships don't change over time
2. **Uniform Weights**: Single coefficient per pair, doesn't capture context variation
3. **Undirected**: Assumes relationships are symmetric (may not always hold)
4. **Complete Graph**: All SDGs connected (may miss isolated goals in practice)
5. **Linear Propagation**: Assumes influence propagates linearly (may be non-linear)

### Assumptions

1. **Coefficient Validity**: Synergy coefficients from research apply to all contexts
2. **Independence**: Centrality measures are independent (may have correlations)
3. **Additivity**: Influence scores can be summed (may have interactions)
4. **Thresholds**: Fixed thresholds for community detection and activation

### Future Improvements

1. **Temporal Networks**: Model time-varying SDG relationships
2. **Contextual Weights**: Adjust coefficients based on geographic, sectoral context
3. **Directed Graphs**: Model asymmetric influence (e.g., SDG 4 → SDG 8)
4. **Multiplex Networks**: Separate layers for different interaction types
5. **Hypergraphs**: Model multi-way interactions beyond pairwise

---

## References

1. **Brandes, U.** (2001). "A Faster Algorithm for Betweenness Centrality". Journal of Mathematical Sociology, 25(2), 163-177.

2. **Page, L., Brin, S., Motwani, R., & Winograd, T.** (1999). "The PageRank Citation Ranking: Bringing Order to the Web". Stanford University Technical Report.

3. **Raghavan, U. N., Albert, R., & Kumara, S.** (2007). "Near Linear Time Algorithm to Detect Community Structures in Large-Scale Networks". Physical Review E, 76(3), 036106.

4. **Newman, M. E. J.** (2010). "Networks: An Introduction". Oxford University Press.

5. **Barabási, A.-L.** (2016). "Network Science". Cambridge University Press.

6. **Watts, D. J., & Strogatz, S. H.** (1998). "Collective Dynamics of 'Small-World' Networks". Nature, 393(6684), 440-442.

7. **SDSN** (2019). "Mapping the SDG Interconnection Network". Sustainable Development Solutions Network.

8. **Nilsson, M., Griggs, D., & Visbeck, M.** (2016). "Policy: Map the Interactions Between Sustainable Development Goals". Nature, 534(7607), 320-322.

---

## Conclusion

The graph model provides a rigorous foundation for analyzing SDG interactions and identifying strategic opportunities for impact. By applying established graph-theoretic methods, the framework enables:

- **Strategic SDG Selection**: Identify high-influence goals
- **Synergy Optimization**: Maximize positive network effects
- **Conflict Mitigation**: Avoid zero-sum dynamics
- **Portfolio Design**: Create balanced, coherent SDG portfolios
- **Impact Amplification**: Leverage network effects for multiplier effects

This mathematical approach transforms SDG planning from intuitive goal selection into a rigorous analytical discipline grounded in network science.
